---
layout: post
title: "VerifIoU: Verified Object Detection and the Next Frontier in Safe CV"
date: 2026-03-16 12:30:00 +0000
description: "Part IV of the safe intelligence series: how VerifIoU certifies localization quality through IoU bounds, and why the next major challenge is geometric verification for object detectors."
tags:
  - verifiou
  - object-detection
  - iou
  - computer-vision
  - formal-verification
  - safe-intelligence
categories:
  - research
  - verification
  - computer-vision
toc:
  beginning: true
citation: true
---

Formal verification for vision has historically focused on **classification**: prove that the correct label is preserved under perturbation. That is important, but it is not yet enough for many deployed systems. In object detection, the central question is not only whether the object is recognized, but whether it is **localized well enough to be useful**.

`VerifIoU` [1] is significant because it changes the verified quantity. Instead of treating the final guarantee as a class-preservation statement, it reasons directly about the task metric that practitioners already use to judge detector quality: **Intersection over Union** (`IoU`).

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/verifiou-two-stage-frontier.svg" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>`VerifIoU` moves verification from label stability to localization quality.</strong> The current paper certifies IoU under perturbations by combining box-output bounds with post-hoc IoU analysis. The natural next step for safe computer vision is to co-propagate uncertainty in both prediction and transformed ground truth under geometric perturbations.</p>
</div>

## Why Detection Is Harder Than Classification

A classifier outputs a label or logits. A detector outputs geometry. Even in the simplified single-object setting used in the paper, the model returns a bounding box

$$
b = [z_0, z_1, z_2, z_3],
$$

where `(z_0, z_1)` and `(z_2, z_3)` denote opposite corners. The correctness notion is not binary in the same sense as class equality. It depends on how much the predicted box overlaps the reference box.

That overlap is measured by IoU:

$$
\mathrm{IoU}_{b_{\mathrm{gt}}}(b)
=
\frac{a(b \cap b_{\mathrm{gt}})}
{a(b) + a(b_{\mathrm{gt}}) - a(b \cap b_{\mathrm{gt}})}.
$$

This quantity is multi-dimensional, non-convex, and highly sensitive to interactions between the four box coordinates. Small coordinate shifts can collapse overlap abruptly. That is why detector verification is not a trivial extension of classifier verification.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/fig1_impact_iou.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Impact of perturbations on IoU</strong> (from VerifIoU paper). Slight vs strong perturbation affects the predicted box and thus IoU—small input changes can significantly reduce overlap.</p>
</div>

## The Two-Stage VerifIoU Pipeline

The design of `VerifIoU` is elegant because it isolates the hard parts.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/fig3_flowchart.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>VerifIoU two-step flow</strong> (from paper). Step 1: bound predicted box via abstract interpretation. Step 2: bound IoU over the reachable box set.</p>
</div>

### Step 1: Bound the detector output

Use an abstract-interpretation or linear-relaxation verifier such as `ERAN`, `Auto-LiRPA` [3], or `CROWN` to derive bounds on the predicted box coordinates:

$$
\underline{z}_i \le z_i \le \overline{z}_i,
\qquad i \in \{0,1,2,3\}.
$$

This yields a reachable set of candidate boxes, typically represented as an interval box in `\mathbb{R}^4`.

### Step 2: Bound IoU over that set

Rather than encoding the IoU computation as another latent layer of the network, the paper treats IoU as a **metric over the reachable box set** and analyzes its extreme values directly.

If `\mathbf{b}` is the set of possible predicted boxes under the perturbation domain, the relevant robustness quantity is

$$
\min_{s \in \Omega(s_0)}
\mathrm{IoU}_{\mathrm{gt}}(f_{\mathrm{OD}}(s))
=
\min_{b \in \mathbf{b}}
\mathrm{IoU}_{\mathrm{gt}}(b).
$$

The detector is certified robust at threshold `t` if

$$
\underline{\mathrm{IoU}}_{\mathrm{gt}}(\mathbf{b}) \ge t.
$$

For instance, `t = 0.5` is the classical "good detection" threshold.

## Vanilla IoU Versus Optimal IoU

The paper develops two bounding strategies.

### Vanilla IoU

Apply interval arithmetic to the constituent expressions for area, intersection, and union. This is easy to implement and solver-agnostic, but it inherits the dependency problem. The resulting bounds can be overly conservative.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/fig4_iou_bounds.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Interval bounds for area, intersection, and IoU</strong> (from VerifIoU paper).</p>
</div>

### Optimal IoU

Exploit the coordinatewise behavior of the IoU function. The key result is that the maximum IoU over the predicted-box interval is attained at the point obtained by clipping each coordinate toward the corresponding ground-truth coordinate:

$$
z_i^*
=
\min\!\bigl(
\max(z_i^{\mathrm{gt}}, \underline{z}_i),
\overline{z}_i
\bigr).
$$

For the minimum IoU, the analysis reduces to checking the vertices of the interval box, with the usual caveat that ill-defined boxes collapse the lower bound to `0`.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/fig7_opt.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Optimal coordinate selection</strong> (from VerifIoU paper). Choice of \(z^*_i\) per coordinate: clip toward ground truth within the interval to maximize IoU.</p>
</div>

This is the kind of result that matters in practice: it converts a non-convex optimization problem into a small number of structured evaluations, while keeping the final bound sound.

## Why This Matters In Computer Vision

`VerifIoU` is especially important because it speaks the language of deployed perception.

In applications like runway localization, autonomous driving, and robotics, a label-only certificate is not enough. The system needs a prediction whose geometry remains usable. A detector that says "runway" but shifts the bounding box enough to spoil downstream control is not robust in any operationally meaningful sense.

That is why the paper's emphasis on aviation is not incidental. It is a model case for safe intelligence:

- the perception task is safety-relevant;
- the performance metric is geometric, not purely categorical;
- regulations increasingly demand robustness evidence, not only empirical evaluation.

## Where This Meets DeepG

At a conceptual level, `DeepG` and `VerifIoU` solve complementary problems.

- `DeepG` [2] certifies **realistic input transformations** for classifiers.
- `VerifIoU` certifies **realistic output metrics** for detectors.

Together they suggest a larger research program: verified computer vision should reason about both the transformation process and the deployment metric.

This is where the most interesting open question appears.

## Verified Object Detection Under Geometric Perturbations

The current `VerifIoU` setting assumes a fixed ground-truth box while the input image is perturbed. That is natural for brightness, contrast, or `L_\infty` noise. It is not sufficient for truly geometric perturbations.

If the image is rotated, translated, scaled, or sheared, then the object support moves **in the image plane itself**. In that setting, a principled certificate should not only propagate uncertainty through the detector. It should also propagate the corresponding transformation through the reference geometry.

In other words, for geometric detector verification one should certify a quantity closer to

$$
\min_{\kappa \in h}
\mathrm{IoU}\!\left(
b_{\mathrm{pred}}(\kappa),
b_{\mathrm{gt}}(\kappa)
\right),
$$

where both the predicted box and the transformed ground-truth geometry depend on the same perturbation parameters `\kappa`.

This point is easy to miss, but it is essential. If the reference geometry is kept artificially fixed while the image undergoes a genuine geometric warp, the certificate may mix model error with coordinate-frame inconsistency.

## Why Ground-Truth Propagation Is Nontrivial

For axis-aligned boxes, co-transforming the annotation is already delicate because a rotated object is no longer naturally represented by an axis-aligned rectangle. The "correct" transformed support may be better captured by:

- an oriented bounding box;
- a polygonal approximation of the object footprint;
- or a segmentation mask.

This is where the frontier becomes genuinely interesting for computer vision.

One plausible route is:

1. propagate geometric bounds through the image formation process, as in `DeepG`;
2. propagate matching bounds through the annotation geometry;
3. approximate the transformed ground truth by a high-resolution polygon;
4. certify a lower bound on polygonal IoU against all admissible detector outputs.

Your hinted formulation fits naturally here. If one represents the transformed support with, say, `256` vertices, then the verifier can seek a certified minimum IoU over that polygonal approximation. The role of the dense discretization is not mystical. It is to make the geometry approximation error negligible relative to the verification bound, especially for slender or rotated objects such as runways.

This is not what `VerifIoU` currently proves. It is the natural next step that the paper helps reveal.

## Why Runways Are A Perfect Case Study

Runway detection is a particularly strong application because it combines all the hard parts:

- geometric perturbations from viewpoint and pose;
- elongated shapes for which poor overlap can have large operational consequences;
- scale variation as the aircraft approaches;
- strong safety requirements and explicit certification pressure.

A credible future certificate for runway detection would likely need all of the following:

- geometric perturbation propagation in the spirit of `DeepG`;
- detector-output bound propagation in the spirit of `VerifIoU`;
- reference-geometry propagation for the ground truth itself;
- a shape representation richer than a naive axis-aligned box.

That is exactly the kind of research direction that belongs under the umbrella of safe intelligence.

## Final Takeaway

The move from classifier robustness to detector robustness is not a minor extension. It changes the object of certification from "class stability" to "task-level geometric adequacy."

`VerifIoU` is important because it makes that move explicit, mathematically precise, and computationally tractable for a meaningful subclass of object-detection problems. It is also important because it shows where the next wall is:

> Safe computer vision will ultimately need certificates that are both transformation-aware and metric-aware.

That is the synthesis of this whole series.

## References & Further Reading

- [VerifIoU preprint][1]
- [DeepG / NeurIPS 2019][2]
- [Auto-LiRPA repository][3]

[1]: https://arxiv.org/abs/2403.08788 "VerifIoU - Robustness of Object Detection to Perturbations"
[2]: https://papers.nips.cc/paper_files/paper/2019/hash/f8eb278a8bce873ef365b45e939da38a-Abstract.html "Certifying Geometric Robustness of Neural Networks"
[3]: https://github.com/Verified-Intelligence/auto_LiRPA "Automatic Linear Relaxation based Perturbation Analysis"
