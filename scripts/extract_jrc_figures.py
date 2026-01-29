#!/usr/bin/env python3
"""
Extract figures and tables from JRC141259_01.pdf:
1. Extract embedded images (cropped by their bounding box)
2. Render full pages that contain figures/tables for vector content
Saves to assets/img/jrc141259/
"""
import sys
from pathlib import Path

# PDF page (0-based) -> list of figure numbers on that page (from List of figures)
PAGE_TO_FIGURES = {
    12: [1],   # p.13
    14: [2],   # p.15
    16: [3],   # p.17
    20: [4],   # p.21
    21: [5, 6, 7],  # p.22
    22: [8, 9],     # p.23
    23: [10],  # p.24
    25: [11],  # p.26
    26: [12],  # p.27
    27: [13, 14],  # p.28
    28: [15, 16],  # p.29-31
    29: [17],  # p.33
    30: [18],  # p.34
    32: [19],  # p.36
    37: [20, 21],  # p.38
    39: [22],  # p.40
    40: [23],  # p.41
    41: [24],  # p.42
    42: [25],  # p.43
    46: [26],  # p.47
    48: [27],  # p.49
    49: [28],  # p.50
    56: [29, 30],  # p.57
    58: [31],  # p.59
    59: [32],  # p.60
    61: [33],  # p.62
    62: [34],  # p.63
    63: [35],  # p.64
    91: [36],  # p.92 annex
    93: [37],  # p.94
    94: [38],  # p.95
    95: [39],  # p.96
    98: [40],  # p.99
}

# Table pages (0-based) for full-page render
TABLE_PAGES = {13, 15, 17, 43, 44, 54, 99}  # Tables 1,2,3,4,5,6,7


def main():
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("Install PyMuPDF: pip install pymupdf")
        sys.exit(1)

    root = Path(__file__).resolve().parent.parent
    pdf_path = root / "JRC141259_01.pdf"
    out_dir = root / "assets" / "img" / "jrc141259"
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    fig_counter = {}  # page -> index for multiple figures per page
    saved = []

    # 1) Extract embedded images and save by figure number when possible
    for page_no in range(len(doc)):
        page = doc[page_no]
        page_1based = page_no + 1
        imgs = page.get_images()
        if not imgs:
            continue
        fig_nums = PAGE_TO_FIGURES.get(page_no, [])
        for img_idx, img_info in enumerate(imgs):
            xref = img_info[0]
            try:
                rects = page.get_image_rects(xref)
            except Exception:
                continue
            for r in rects:
                w, h = r.width, r.height
                if w < 80 or h < 80:  # skip tiny icons/logos
                    continue
                # Crop and render this region
                zoom = 2.0
                mat = fitz.Matrix(zoom, zoom)
                clip = fitz.Rect(r.x0, r.y0, r.x1, r.y1)
                pix = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
                if pix.width < 100 or pix.height < 100:
                    continue
                # Assign figure number or generic name
                if fig_nums and img_idx < len(fig_nums):
                    name = f"jrc-fig-{fig_nums[img_idx]}"
                elif fig_nums:
                    idx = fig_counter.get(page_no, 0)
                    fig_counter[page_no] = idx + 1
                    name = f"jrc-fig-{fig_nums[min(idx, len(fig_nums)-1)]}-{idx}"
                else:
                    name = f"jrc-p{page_1based}-img{img_idx}"
                out_path = out_dir / f"{name}.png"
                pix.save(str(out_path))
                saved.append(out_path.name)
    doc.close()

    # 2) Render full pages for key figure/table pages (vector charts, tables)
    doc = fitz.open(pdf_path)
    zoom = 1.5
    mat = fitz.Matrix(zoom, zoom)
    all_fig_pages = set(PAGE_TO_FIGURES.keys())
    for page_no in sorted(all_fig_pages | TABLE_PAGES):
        if page_no >= len(doc):
            continue
        page = doc[page_no]
        page_1based = page_no + 1
        pix = page.get_pixmap(matrix=mat, alpha=False)
        if page_no in TABLE_PAGES and page_no not in all_fig_pages:
            out_path = out_dir / f"jrc-table-p{page_1based}.png"
        else:
            out_path = out_dir / f"jrc-page-{page_1based}.png"
        pix.save(str(out_path))
        saved.append(out_path.name)
    doc.close()

    print(f"Saved {len(saved)} images to {out_dir}")
    for n in sorted(saved):
        print(f"  {n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
