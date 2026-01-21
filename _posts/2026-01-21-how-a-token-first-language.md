---
layout: post
title: "How a Token-First Language Axis Is Reshaping Multimodal AI"
date: 2026-01-21 11:00:00+0000
description: Discrete tokens, any-to-any learning, and why language is becoming the operating system of multimodal AI.
tags: [ai, multimodal, foundation-models, vision-language, deep-learning]
categories: [research, ai]
toc:
  beginning: true
citation: true
---

## Why We Need Foundational Multimodal Models

Today’s AI landscape is fractured. Vision models, language models, and geometric/semantic prediction pipelines each solve narrow tasks. Yet real-world systems—from robotics to complex retrieval agents—require **joint reasoning across perception, structure, and semantics**.

Current multimodal systems rely on:
- task-specific heads,
- bespoke pipelines,
- engineering-heavy loss balancing.

This approach *does not scale*. It fragments learning into silos instead of enabling true **compositional understanding and control**.

We need what language models gave us for text: a **foundation model** whose representations can be queried, composed, and extended without redesigning the architecture for every new task or modality.

This is exactly the paradigm shift that [*4M: Massively Multimodal Masked Modeling*](https://4m.epfl.ch/) and its scaled variant [*4M-21: An Any-to-Any Vision Model for Tens of Tasks and Modalities*](https://4m.epfl.ch/) introduce.

> "A framework for training any-to-any multimodal foundation models. Scalable. Open-sourced. Across tens of modalities and tasks." — [*4M official page*](https://4m.epfl.ch/)

## Unifying Modalities Through Discrete Tokens

![Modalities overview](https://storage.googleapis.com/four_m_site/images/4M_modalities.svg)  
*4M trains a single model to predict any modality from any subset of others using discrete tokenization.* ([Source: 4M project page](https://4m.epfl.ch/))

At the core of 4M and 4M-21 is **discrete tokenization**:

- Images, depth maps, geometry, semantic maps, captions, and feature maps all become sequences of discrete tokens.
- A **single transformer encoder-decoder** predicts masked tokens from visible ones.
- There are no task-specific heads or bespoke objectives.

The official site summarizes this succinctly:

> "By tokenizing modalities into sequences of discrete tokens, we can train a single unified Transformer encoder-decoder on a diverse set of modalities." ([Source: 4M project page](https://4m.epfl.ch/))

This token-centric representation is the **unifying abstraction** that lets one model handle diverse data types without architectural surgery.

## Any-to-Any Generation: Tasks Become Queries

![4M chained generation animation](https://storage.googleapis.com/four_m_site/videos/4M_chained_generation.mp4#t=32.5)  
*4M can generate any modality from any conditioning set in a self-consistent chained manner.* ([Source: 4M project page](https://4m.epfl.ch/))

One of the most striking capabilities shown on the official page is **any-to-any generation**. Instead of solving fixed tasks like “caption this image” or “predict depth from color”, 4M generates all modalities from whichever subset you choose.

The generation works by:
1. Predicting missing tokens for one modality.
2. Feeding fully generated modalities back into the model.
3. Repeating until all target modalities are generated.

This yields *self-consistent, multimodal predictions* without loss balancing or head selection (see [4M project page](https://4m.epfl.ch/)).

## Fine-Grained Control & Steerability

![Multimodal editing examples](https://storage.googleapis.com/four_m_site/images/4M_editing.svg)  
*4M supports multimodal editing and fine-grained control, such as bounding box–guided RGB generation.* ([Source: 4M project page](https://4m.epfl.ch/))

Because 4M represents all data in token form, it supports:
- partial conditioning (e.g., captions + bounding boxes),
- semantic and geometric guidance,
- compositional weighting of conditions.

The official visuals demonstrate how changing a **bounding box** input can reorganize the RGB output—semantic edits become natural rather than hacky ([4M project page](https://4m.epfl.ch/)).

## Language Co-Training & Improved Understanding

![Improved text understanding](https://storage.googleapis.com/four_m_site/images/4M_text_understanding.svg)  
*4M-21 models co-trained with text corpora show stronger text understanding than smaller multimodal variants.* ([Source: 4M project page](https://4m.epfl.ch/))

4M-21 extends 4M by co-training on large text corpora and incorporating **language as a structural modality** rather than a side condition. The official site notes:

> "4M models trained on a larger variety of modalities and co-trained on a text corpus exhibit a higher degree of text understanding." ([Source: 4M project page](https://4m.epfl.ch/))

This positions language not just as a human interface, but as a **semantic scaffold** the model uses internally to organize multimodal representations.

## Beyond Generation: Retrieval and Evaluation

The official project page also highlights:

- **Multimodal retrieval** by predicting global embeddings from any modality ([4M project page](https://4m.epfl.ch/)).
- **Out-of-the-box evaluations** showing 4M-21's performance often matches or surpasses specialist baselines and multimodal competitors like Unified-IO ([4M project page](https://4m.epfl.ch/)).

## Authors and Official Attribution

This work is the result of collaboration between EPFL and Apple researchers:

> *David Mizrahi, Roman Bachmann, Oğuzhan Fatih Kar, Teresa Yeo, Mingfei Gao, Afshin Dehghan, Amir Zamir… and colleagues* — *4M & 4M-21 teams*.

Both papers are available from the [official 4M project site](https://4m.epfl.ch/):
- **4M: Massively Multimodal Masked Modeling** (NeurIPS 2023) — Mizrahi et al., 2023
- **4M-21: An Any-to-Any Vision Model for Tens of Tasks and Modalities** (NeurIPS 2024) — Bachmann et al., 2024

## Conclusion: Foundations Built, But the Frontier Remains

4M and 4M‑21 mark a turning point in multimodal AI. They show that:

- **Unified token spaces work across dozens of modalities**  
- **Language can serve as a structural interface, not just a conditioning signal**  
- **Tasks can emerge from conditioning rather than engineered heads**  
- **Models can scale without performance collapse, even as modalities triple**  

Yet as impressive as these results are, the frontier of **true multimodal intelligence** is still wide open.

### What 4M‑21 Does Not Do—Yet

The project is not a reasoning-first system. It cannot plan, chain steps explicitly, or act autonomously:

- **Emergent reasoning is limited**: There’s no explicit chain-of-thought or planning; constraint satisfaction occurs implicitly across tokens.  
- **Tokenization bottlenecks exist**: Discretization is lossy, which limits fidelity for complex modalities.  
- **Dataset alignment is partial**: Some modalities and datasets are only loosely coordinated, leaving room for inconsistencies in training.

In other words, 4M‑21 is a **foundation backbone**, not an agent or cognitive system. It lays the groundwork, but the “thinking” part—planning, instruction-following, and compositional reasoning—is still to come.

### The Road Ahead: Directions to Watch

The official project and research notes point to several promising avenues:

1. **Better tokenization schemes**  
   Adaptive, higher-fidelity tokenizers could reduce reconstruction loss and improve fine-grained multimodal generation.

2. **Explicit reasoning objectives**  
   Integrating constraint-based or reasoning-centered training could turn implicit consistency into explicit reasoning capabilities.

3. **Instruction tuning over token sequences**  
   Just like LLMs benefit from instruction fine-tuning, multimodal backbones could learn to follow structured multimodal instructions across domains.

4. **Integration with agentic architectures**  
   Combining unified token spaces with LLM-style planners, memory modules, or embodied agents could finally unlock reasoning and agency in multimodal systems.

In short, 4M‑21 has built the **scalable, unified foundation**, and the next frontier is layering **reasoning, instruction-following, and agency** on top.  

> The lesson for the field is clear: multimodal AI has crossed the threshold of scalability and unification—but intelligence still has a way to go. The foundation is there; now comes the building.


---

## References

- [4M official project page](https://4m.epfl.ch/), *Massively Multimodal Masked Modeling*, EPFL / Apple Research.
- Bachmann, R., et al. (2024). *4M-21: An Any-to-Any Vision Model for Tens of Tasks and Modalities*. Advances in Neural Information Processing Systems (NeurIPS 2024). Available at [4m.epfl.ch](https://4m.epfl.ch/).
- Mizrahi, D., et al. (2023). *4M: Massively Multimodal Masked Modeling*. Advances in Neural Information Processing Systems (NeurIPS 2023). Available at [4m.epfl.ch](https://4m.epfl.ch/).
