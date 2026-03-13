---
layout: post
title: "Why Intervals Break: DPNEURIFYFV and the Dependency Problem"
date: 2026-03-14 11:30:00 +0000
description: "Part II of the safe intelligence series: why naive interval methods deteriorate with depth, and how DPNEURIFYFV sharpens symbolic interval propagation with fresh variables and branch-and-bound."
tags:
  - formal-verification
  - symbolic-intervals
  - dpneurifyfv
  - branch-and-bound
  - safe-intelligence
categories:
  - research
  - verification
  - machine-learning
toc:
  beginning: true
citation: true
---

The first post in this series introduced the **verifier's worldview** through `DeepPoly`: we certify a property by propagating a sound abstraction of all admissible behaviors. The next question is unavoidable:

> Why do apparently reasonable abstractions become useless as networks deepen?

The answer is the **dependency problem**. `DPNEURIFYFV` [1] is valuable in this series not because it directly introduces geometric robustness, but because it makes that bottleneck explicit and shows one principled way to fight it.

<div class="row mt-3 justify-content-center">
    <div class="col-sm-10 mt-3 mt-md-0 d-flex justify-content-center">
        {% include figure.liquid loading="eager" path="assets/img/safe-intelligence/dpneurify-dependency-splitting.svg" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="caption text-center">
    <p><strong>The precision bottleneck is not only solver power but dependency management.</strong> `DPNEURIFYFV` improves symbolic interval propagation by introducing fresh variables where they pay off most, then shrinking the remaining uncertainty through branch-and-bound input splitting.</p>
</div>

## The Basic Failure Mode Of Intervals

Ordinary interval arithmetic is fast because it treats each variable as an independent range. That same simplification is also what breaks it.

If `x \in [\underline{x}, \overline{x}]`, then interval subtraction gives

$$
[x, x] - [x, x] = [\underline{x} - \overline{x}, \overline{x} - \underline{x}],
$$

even though the exact expression `x - x` is always `0`. The abstraction forgot that the two appearances of `x` refer to the _same_ quantity. Once that information is lost, overapproximation compounds layer after layer.

Deep networks are particularly harsh on this kind of error accumulation because every layer reuses uncertain quantities produced by previous layers. By the time the computation reaches the output, the relaxation may still be sound, but far too loose to certify anything interesting.

## Symbolic Intervals: Better, But Not Free

Symbolic interval propagation improves on bare intervals by keeping affine lower and upper forms in the original inputs:

$$
z \in [\ell(x), u(x)],
$$

where

$$
\ell(x) = a^\top x + \alpha,
\qquad
u(x) = b^\top x + \beta.
$$

This preserves more dependency information because the same input variables appear explicitly in the bounds. In particular, a variable cannot simultaneously take two unrelated values merely because it appears in two places.

But symbolic intervals are not magic. They still face two interacting problems:

- dependencies are only preserved as long as the symbolic representation remains tractable;
- non-linear activations such as `ReLU` force relaxations that inject new approximation error.

The result is that even symbolic methods can deteriorate with depth.

## The Verification Objective

`DPNEURIFYFV` considers verification problems of the now-standard form

$$
\max_x c^\top y + b
$$

subject to

$$
y = f_N(x), \qquad x \in H,
$$

where `H` is an input hyperrectangle. If the maximal violation is at most `0`, the property is certified. If a point with positive value exists, it is a counterexample.

What matters here is not the optimization statement itself, but the fact that symbolic bounds must remain sufficiently tight for the resulting upper bound on the objective to be meaningful.

## Fresh Variables As A Controlled Reset

The central technical idea in `DPNEURIFYFV` is to introduce **fresh variables** inside symbolic interval propagation.

At first glance, this sounds backward. Why add variables when verification is already struggling? The reason is subtle: sometimes a carefully chosen fresh variable acts as a _compression device_ for accumulated dependency structure. Instead of carrying a long chain of increasingly distorted symbolic expressions, the method introduces a new symbolic handle that better matches the current computation.

Conceptually, this is a controlled reset of the abstraction.

- Without fresh variables, symbolic expressions can become bloated and poorly aligned with the actual dependency structure.
- With too many fresh variables, one throws away useful global information and pays extra computational cost.
- The hard part is deciding **where** the reset buys enough precision to justify itself.

`DPNEURIFYFV` contributes heuristics precisely for that choice: how many fresh variables to introduce per layer, and which neurons should be prioritized.

## Why Branch-And-Bound Still Matters

Even after improving symbolic propagation, some uncertainty regions remain too large. The second major ingredient is therefore **input splitting** inside a branch-and-bound loop.

The idea is standard in verification but powerful in this context:

1. compute a sound bound on the objective over the current input region;
2. if the bound is already safe, certify that region;
3. if the region may still contain a violation, split it;
4. recurse on the smaller subregions.

This works because a coarse but safe abstraction on a large region often becomes much sharper on smaller ones. `DPNEURIFYFV` adds a splitting heuristic informed by internal overapproximation rather than relying only on naive geometric criteria. In that sense it complements the affine-bound worldview established by `DeepPoly` [2], but pushes harder on symbolic dependency management.

In other words, it does not merely ask _where the input box is large_; it asks _where the abstraction is leaking precision_.

## Why Low-Dimensional Inputs Are Special

The paper focuses on ReLU networks with **low-dimensional input spaces**, notably in settings like `ACAS Xu`. That restriction is important. Branch-and-bound can be highly effective when the input dimension is modest, but it quickly becomes difficult in raw-image settings where the input dimension is enormous.

This makes `DPNEURIFYFV` a good explanatory bridge in the present series:

- it shows how precision can be recovered by better symbolic reasoning;
- it also makes clear why image-space vision verification often needs a different strategy altogether.

That "different strategy" is precisely what we will see in `DeepG`: rather than split a huge image space naively, it constructs a tight relaxation over a **small geometric parameter space**.

## Why This Matters For Safe Intelligence

One of the recurring myths in verification is that progress comes only from stronger solvers. `DPNEURIFYFV` is a useful corrective. A large part of verification quality depends on how we _represent uncertainty_ before any exact solver or search procedure is applied.

That is a safe-intelligence lesson in its own right.

If the abstraction forgets the wrong dependencies, the system may be formally sound yet practically useless. The challenge is not merely to overapproximate, but to overapproximate in a way that preserves exactly the structure needed for the downstream property.

## A Small But Important Connection To The Rest Of The Series

`DPNEURIFYFV` is not the same line of work as `DeepG`, and it is not a direct stepping stone in a historical sense. But conceptually it prepares the ground for everything that follows.

It teaches us to ask:

- where does looseness enter the pipeline?
- which dependencies matter most for the target property?
- can we redesign the abstraction around the geometry of the problem rather than the literal sequence of operations?

These are the right questions for geometric robustness, and later for certified object detection.

## Bridge To Geometric Certification

In vision, the dependency problem becomes even more severe. A single transformed pixel may depend on interpolation, spatial coordinates, and photometric parameters at once. If we propagate intervals through each step separately, the uncertainty blows up.

That is why the next post matters: `DeepG` abandons stepwise bound propagation and instead constructs a tight relaxation for the **entire transformation composition**. Seen from the perspective of this post, `DeepG` is not a conceptual rupture. It is a highly targeted response to the same precision bottleneck.

## References & Further Reading

- [DPNEURIFYFV / Formal Verification of Machine Learning Workshop 2022][1]
- [DeepPoly / POPL 2019][2]
- [VNN-COMP overview][3]

[1]: https://arxiv.org/abs/2212.08567 "Optimized Symbolic Interval Propagation for Neural Network Verification"
[2]: https://dl.acm.org/doi/10.1145/3290354 "An Abstract Domain for Certifying Neural Networks"
[3]: https://sites.google.com/view/vnn2024 "International Competition on Verification of Neural Networks"
