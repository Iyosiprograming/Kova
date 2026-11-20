from PIL import Image, ImageDraw

def create_kova_icon():
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    base_size = 512
    img = Image.new("RGBA", (base_size, base_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded Dark Slate Background Shield
    # #151821 with #C5F36A border
    draw.rounded_rectangle([32, 32, 480, 480], radius=96, fill=(21, 24, 33, 255), outline=(197, 243, 106, 255), width=16)

    # Clapperboard top strip (slanted chevrons)
    # Background strip
    draw.rounded_rectangle([96, 110, 416, 190], radius=16, fill=(30, 35, 48, 255))
    # Chevrons in #C5F36A
    chevrons = [
        [(130, 190), (170, 110), (210, 110), (170, 190)],
        [(230, 190), (270, 110), (310, 110), (270, 190)],
        [(330, 190), (370, 110), (410, 110), (370, 190)],
    ]
    for poly in chevrons:
        draw.polygon(poly, fill=(197, 243, 106, 255))

    # Center Play Symbol in #C5F36A
    play_triangle = [(210, 240), (340, 325), (210, 410)]
    draw.polygon(play_triangle, fill=(197, 243, 106, 255))

    # Save multi-size .ico files
    icon_images = [img.resize(s, Image.Resampling.LANCZOS) for s in sizes]
    
    # Root icon for PyInstaller
    icon_images[0].save("app.ico", format="ICO", sizes=sizes, append_images=icon_images[1:])
    # Frontend public favicon
    icon_images[0].save("frontend/public/app.ico", format="ICO", sizes=sizes, append_images=icon_images[1:])
    print("Icons successfully created: app.ico and frontend/public/app.ico")

if __name__ == "__main__":
    create_kova_icon()
