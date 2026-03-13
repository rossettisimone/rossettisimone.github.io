---
layout: post
title: "DeepG: Certifying Geometric Robustness in Computer Vision"
date: 2026-03-15 12:00:00 +0000
description: "Part III of the safe intelligence series: how DeepG certifies neural networks against realistic geometric perturbations by relaxing the whole image-transformation composition at once."
tags:
  - geometric-robustness
  - deepg
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

Robustness to `L_p` perturbations is useful, but it is not how many vision systems fail in the world. Cameras move. Objects translate in the field of view. Apparent scale changes with distance. Imaging pipelines alter brightness and contrast. In safety-critical perception, these are not adversarial edge cases. They are part of the operating environment.

This is the problem space where `DeepG` [1] becomes important. It asks whether a neural network can be **formally certified against parameterized geometric transformations**, not just against independent per-pixel perturbations.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/deepg-composition.svg" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>`DeepG` attacks the precision problem at the right level of abstraction.</strong> Instead of propagating loose bounds through every transformation primitive, it builds sound linear envelopes for the entire mapping from geometric parameters to transformed pixels, then hands those envelopes to a verifier such as DeepPoly.</p>
</div>

## Why Geometry Is Different

Pixel-wise perturbation models assume uncertainty acts independently on each input coordinate. Geometric transformations do not behave that way. A rotation or translation couples many pixels through a small set of latent parameters. The transformed image is highly structured.

This should make verification easier in principle: the uncertainty lives in a low-dimensional parameter space. Yet naive methods often fail because they propagate bounds through a long chain of intermediate computations:

- inverse spatial transformation;
- interpolation on the input grid;
- photometric adjustment such as brightness or contrast;
- neural network inference on the resulting image set.

Each step is sound on its own, but the looseness compounds.

## The Image Formation Model

`DeepG` formalizes the transformed pixel value as a composition. For a target pixel at coordinates `(x,y)`,

$$
\tilde{p}_{x,y}
= I_{\kappa}(x,y)
= P_{\alpha,\beta} \circ I \circ T_{\mu}^{-1}(x,y),
$$

where:

- `T_\mu` is the spatial transformation, parameterized by `\mu` and typically including rotation, translation, scaling, or shearing;
- `I` is bilinear interpolation;
- `P_{\alpha,\beta}(\xi) = \alpha \xi + \beta` models contrast and brightness;
- `\kappa = (\alpha,\beta,\mu)` is the full parameter vector constrained to a hyperrectangle `h`.

The bilinear interpolation term is already enough to reveal the difficulty. In the notation of the paper,

$$
I(x,y)
= \frac{1}{4}
\sum_{\delta_i,\delta_j \in \{0,2\}}
p_{i+\delta_i,j+\delta_j}
\left(2 - \left|i + \delta_i - x\right|\right)
\left(2 - \left|j + \delta_j - y\right|\right),
$$

up to the indexing convention used for the interpolation region. The key point is not the exact typography of the formula but the structure: a transformed pixel becomes a nontrivial function of the geometric parameters, the interpolation neighborhood, and the source image.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-12 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="lazy" path="assets/img/safe-intelligence/fig2_rotation.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Fig. 2 from DeepG.</strong> Image rotated by \(-\pi/4\): (a) original, (b) interpolation regions \(A_{i,j}\), (c) rotated result. Bilinear interpolation averages over 2×2 regions, amplifying the dependency problem when bounds are propagated stepwise.</p>
</div>

## Why Stepwise Bound Propagation Fails

Suppose we try to certify the transformation by propagating intervals through each primitive:

1. bound the preimage coordinates under `T_\mu^{-1}`;
2. bound the interpolation result over those coordinates;
3. bound the photometric map;
4. feed the resulting transformed-image set to a verifier.

This is exactly where the lessons from the previous post reappear. The bounds are sound, but the method forgets too much structure at each intermediate stage. By the time the uncertainty reaches the verifier, the input relaxation can be so large that certification becomes impossible.

This is why `DeepG` is best understood as a precision-engineering paper. Its novelty is not merely that it handles geometry. It handles geometry **without accepting per-step abstraction loss as inevitable**.

## DeepG's Key Move: Relax The Whole Composition

The central idea is to approximate the output set of transformed pixels **directly as a function of the transformation parameters**. Rather than propagate a bound through each operation, `DeepG` computes sound linear lower and upper envelopes over the whole parameter box `h`:

$$
b_\ell + w_\ell^\top \kappa \le I_\kappa(x,y) \le b_u + w_u^\top \kappa.
$$

These linear constraints form a convex relaxation of the transformed image set. Once they are available for all relevant pixels, a verifier such as `DeepPoly` [2] can reason about the neural network on that much tighter input abstraction.

This is the crucial architectural inversion:

- previous methods relaxed the **process** step by step;
- `DeepG` relaxes the **resulting transformed-image set** as a whole.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-12 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="lazy" path="assets/img/safe-intelligence/fig1_comparison.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Fig. 1 from DeepG (Balunović et al.).</strong> End-to-end certification: Interval and Polyhedra relaxations are loose; DeepG's shape G hugs the transformed-image set more tightly, so the verifier can certify more often.</p>
</div>

## Sampling, LP, And Lipschitz Correction

The method combines three ingredients.

### 1. Sampling

Sample many parameter points `\kappa_1,\dots,\kappa_N` in the admissible region `h` and evaluate the transformed pixel values.

### 2. Linear fitting by optimization

Fit lower and upper affine forms in `\kappa` to those sampled outputs. The objective is to minimize the average gap between the upper and lower envelopes:

$$
\frac{1}{V} \int_h \left(U_\kappa - L_\kappa\right)\, d\kappa
$$

subject to soundness constraints

$$
L_\kappa \le I_\kappa(x,y) \le U_\kappa,
\qquad
L_\kappa, U_\kappa \text{ linear in } \kappa.
$$

### 3. Soundness repair by Lipschitz optimization

The initial fit from finite samples is not automatically sound everywhere on `h`. `DeepG` therefore defines the violation function for the lower envelope

$$
f(\kappa) = b_\ell' + {w_\ell'}^\top \kappa - I_\kappa(x,y)
$$

and computes an upper bound `v_\ell` on its maximum over `h`. The corrected lower bound becomes

$$
b_\ell = b_\ell' - v_\ell - \varepsilon,
\qquad
w_\ell = w_\ell'.
$$

An analogous correction applies to the upper envelope. This is the step that turns a good empirical fit into a formal certificate.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-12 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="lazy" path="assets/img/safe-intelligence/fig3_enclosure.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Fig. 3 from DeepG.</strong> Unsound fit (Step 1) vs sound corrected envelope (Step 3) vs interval bounds. DeepG's sound region remains much tighter than stepwise interval propagation.</p>
</div>

## What The Guarantee Means

The paper proves that, under the stated assumptions, the generated constraints are sound and approach the optimal linear relaxation asymptotically as the number of samples grows. This matters in practice because it explains why the method achieves both properties that verification papers usually trade against each other:

- **soundness**, because the final bounds are globally corrected;
- **tightness**, because the fit is optimized around the actual transformation behavior rather than built from generic local transformers.

## Why DeepG Matters In Computer Vision

`DeepG` is one of the cleanest examples of how a verification method becomes genuinely computer-vision-aware.

In many deployed vision systems, the perturbation of interest is not "every pixel changes independently within `\epsilon`." It is something like:

- the camera rotates slightly during approach;
- an object appears at a nearby scale because the platform moved;
- the scene shifts under viewpoint change;
- illumination changes alter brightness and contrast.

These are low-dimensional, physically meaningful variations. `DeepG` leverages exactly that structure.

The application relevance is immediate:

- **aviation**: runway approach images vary under pitch, yaw, and distance-induced scale;
- **robotics**: camera pose and viewpoint drift are endemic;
- **automotive perception**: object appearance changes continuously with ego-motion and relative motion.

In all three cases, certifying robustness to realistic geometric perturbations is more meaningful than certifying only to pixel noise.

## A Quantitative Reading Of The Contribution

The paper reports substantial certification gains over interval and polyhedral baselines. In the teaching material derived from the paper, the headline comparison is roughly:

- `DeepG`: certification rates between `34%` and `90%` depending on the setup;
- interval baseline: often between `0%` and `7.1%`;
- polyhedral baseline: improved but still significantly weaker, around `12%` to `23%` in the highlighted comparisons.

The exact percentages depend on architecture, training method, and transformation class. The deeper point is methodological: the performance jump is driven by _where_ the relaxation is constructed, not only by a stronger downstream verifier.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-12 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="lazy" path="assets/img/safe-intelligence/table1_certified.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Table 1 from DeepG.</strong> Certification rates: DeepG vs Interval propagation across transformations (rotation R, translation T, scaling Sc, shearing Sh, brightness/contrast B).</p>
</div>

## Limits And Open Questions

`DeepG` is powerful, but it does not solve everything.

- It still assumes a transformation family that can be reasoned about through the chosen parameterization.
- The final certificate remains only as useful as the downstream verifier that consumes the transformed-image abstraction.
- The target property is still classification-oriented: label invariance under transformation.

That last point is what makes the next step especially interesting. In many vision systems, the relevant question is not whether the class is preserved, but whether the **geometry of the prediction remains operationally acceptable**.

This is exactly where `VerifIoU` enters.

## Bridge To Verified Detection

`DeepG` teaches a crucial lesson for safe intelligence in computer vision: when the perturbation model is geometric, the verifier should reason in a geometry-aware parameter space rather than in raw pixel space alone.

But classification is only part of the deployment story. A detector may keep the correct class while localizing the object poorly enough to become useless. The next post therefore moves from certifying a **label property** to certifying a **task metric**: the worst-case Intersection over Union of the predicted box with the ground truth.

## References & Further Reading

- [DeepG / NeurIPS 2019][1]
- [DeepPoly / POPL 2019][2]
- [ERAN repository][3]

[1]: https://papers.nips.cc/paper_files/paper/2019/hash/f8eb278a8bce873ef365b45e939da38a-Abstract.html "Certifying Geometric Robustness of Neural Networks"
[2]: https://dl.acm.org/doi/10.1145/3290354 "An Abstract Domain for Certifying Neural Networks"
[3]: https://github.com/eth-sri/eran "ETH Robustness Analyzer for Neural Networks"
