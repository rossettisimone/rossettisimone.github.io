---
layout: post
title: "Formal Verification for Safe Intelligence: The DeepPoly View"
date: 2026-03-13 11:00:00 +0000
description: "Part I of a technical series on safe intelligence: why empirical robustness is not enough, and how DeepPoly made neural network certification both sound and scalable."
tags:
  - formal-verification
  - neural-networks
  - abstract-interpretation
  - deeppoly
  - safe-intelligence
categories:
  - research
  - verification
  - machine-learning
toc:
  beginning: true
citation: true
---

This post is the first entry in a short series on **safe intelligence** in the research sense: the study of how learning systems can be made trustworthy enough for high-stakes deployment by combining machine learning with formal guarantees. The concrete question is simple to state and hard to answer:

> Given a set of admissible inputs, can we _prove_ that a neural network will satisfy a desired property for **all** of them?

That is the worldview of formal verification. It is not about whether a model performs well on average, nor about whether a gradient-based attack happened to fail on a finite sample. It is about whether the property holds over an entire set.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/deeppoly-abstract-domain.svg" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>Formal verification replaces pointwise testing with set reasoning.</strong> DeepPoly's key contribution was to propagate a sound overapproximation of all reachable neuron values, then prove the output property on that abstraction instead of sampling individual adversarial candidates.</p>
</div>

## Why Testing Is Not Enough

In safety-critical machine learning, failure is usually about the tail of the distribution, not the mean. A perception model in an aircraft, medical device, or automated vehicle does not get to be wrong merely because the wrong case was improbable. The question changes from

> "How often is the model correct?"

to

> "Can we exclude classes of failures over a specified operational envelope?"

Empirical robustness methods search for counterexamples. Verification reasons about their absence. This distinction matters because many perturbation sets are combinatorially or continuously large. Even a small `L_\infty` neighborhood around an image contains an astronomical number of concrete inputs.

## The Verification Problem

Let `f` be a neural network, `x` an input, and `y = f(x)` its output. Verification starts with two ingredients:

1. an **input set** `H`, often a hyperrectangle around a nominal input `x_0`;
2. an **output property** `P(y)` that encodes the requirement we want to prove.

For adversarial robustness, a standard input region is

$$
H = \left\{x \in \mathbb{R}^{d_0} \mid \underline{x}_i \le x_i \le \overline{x}_i,\; i = 1,\dots,d_0 \right\}.
$$

Many verification queries can be reduced to a linear output constraint of the form

$$
c^\top y + b \le 0.
$$

Equivalently, one can ask whether the maximum violation over the admissible input set stays non-positive:

$$
\max_{x \in H} c^\top f(x) + b \le 0.
$$

If the answer is yes, the property is certified. If not, either the property is false or the overapproximation is too coarse to prove it. That distinction, between **actual failure** and **failure to certify**, runs through the entire literature.

## DeepPoly's Core Idea

The important move in `DeepPoly` [1] is to avoid exact set propagation, which is generally intractable, while also avoiding crude interval reasoning, which is often too loose. The paper introduces a neural-network-specific **abstract domain** that combines:

- interval bounds, which are cheap and stable;
- polyhedral-style affine constraints, which capture dependencies between variables;
- custom abstract transformers for affine layers, `ReLU`, sigmoid, `tanh`, and max-pooling;
- sound floating-point reasoning, so the certificate actually matches the machine computation.

The intuition is that each neuron is represented not just by a scalar lower and upper bound, but also by affine constraints tying its value back to earlier variables. A typical DeepPoly-style representation for an activation `x_i` looks like

$$
\underline{a}_i(x_1,\dots,x_{i-1}) \le x_i \le \overline{a}_i(x_1,\dots,x_{i-1}),
$$

where `\underline{a}_i` and `\overline{a}_i` are affine forms. This is much richer than a bare interval `[l_i, u_i]`, because it preserves some dependency information without incurring the full cost of unrestricted polyhedra.

## Why The Abstract Domain Matters

There is a recurring tension in verification:

- richer abstractions preserve more structure but can become computationally prohibitive;
- simpler abstractions scale but destroy too much information.

DeepPoly mattered because it landed at a historically important point on that curve. It was more precise than earlier scalable abstract-interpretation methods such as `AI2` [2], more scalable than exact polyhedral reasoning, and practical on convolutional networks rather than only tiny feedforward benchmarks. Just as importantly, it was **sound for floating-point arithmetic**, a subtle but non-negotiable requirement in any serious assurance setting.

This is not a cosmetic point. An unsound verifier can produce a false certificate. In safety-critical work, a wrong proof is worse than no proof.

## What DeepPoly Actually Certifies

Suppose the correct class for an input is `k`. A standard robustness property is that every allowed perturbation preserves the logit ordering

$$
f_k(x) - f_j(x) \ge 0 \qquad \text{for all } j \ne k,\; x \in H.
$$

Rather than evaluate `f` on infinitely many inputs in `H`, DeepPoly propagates the whole set through the network and computes a sound overapproximation of all reachable activations. At the output layer, if the lower bound on `f_k - f_j` is non-negative for every competing class `j`, the classification is certified over the entire region.

This is the basic template we will reuse later:

1. define the admissible set;
2. overapproximate all reachable model outputs;
3. prove the target property on the overapproximation.

DeepPoly gives the first mature instance of this template in our series.

## Why This Was A Turning Point

Historically, `DeepPoly` is important for two reasons.

First, it turned abstract interpretation from a generic verification concept into a domain crafted specifically for deep networks. The operators are not afterthoughts: they are designed around the algebra of neural layers and activations.

Second, it made clear that robustness certification is fundamentally an _abstraction design_ problem. The challenge is not only solver strength. It is also deciding what information to preserve while propagating uncertainty.

That insight will matter even more in the next two posts:

- `DPNEURIFYFV` asks how symbolic interval propagation can preserve dependencies more effectively;
- `DeepG` asks how to certify **geometric** transformations without accumulating looseness at every intermediate step.

## Limits Already Visible

DeepPoly is a foundational verifier, not the end of the story.

- It still faces precision loss when perturbation sets become large.
- Complex non-linear input transformations are hard to encode tightly with stepwise propagation.
- The abstraction is tailored to classification-style properties; later work must move toward task-level metrics.

Those are not incidental limitations. They are exactly the pressure points that drive the transition from `DeepPoly` to the rest of the series.

## Why This Belongs To Safe Intelligence

If one phrase captures the contribution of DeepPoly, it is this: **it changed the question from "did we fail to find an attack?" to "can we prove the absence of an attack over a specified region?"**

That shift is one of the central moves in safe intelligence as a research area. Safe intelligence is not just about building models that look robust in aggregate. It is about making the operational claim explicit, mathematically encoding it, and then proving it against a formally defined uncertainty set.

DeepPoly does not solve the entire assurance problem for machine learning. But it provides the verifier's worldview on which the later, more vision-specific methods are built.

## References & Further Reading

- [DeepPoly / POPL 2019][1]
- [AI2: abstract interpretation for neural nets][2]
- [ERAN project page][3]

[1]: https://dl.acm.org/doi/10.1145/3290354 "An Abstract Domain for Certifying Neural Networks"
[2]: https://theory.stanford.edu/~barrett/pubs/GKJ+18.pdf "AI2: Safety and Robustness Certification of Neural Networks with Abstract Interpretation"
[3]: https://github.com/eth-sri/eran "ETH Robustness Analyzer for Neural Networks"
