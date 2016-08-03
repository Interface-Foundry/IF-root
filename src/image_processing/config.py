def make_image_configs(font_dict, origin=None):
    config = {}
    config['CHAT_WIDTH'] = 365
    config['CHAT_HEIGHT'] = 140
    config['PADDING'] = 5
    config['BGCOLOR'] = 'white'
    config['length'] = 3
    config['biggest_width'] = 0
    config['biggest_height'] = 0
    config['thumbnails'] = []
    config['PIC_SIZE'] = 130, 130
    config['CHAT_WIDTH'] = 365
    config['CHAT_HEIGHT'] = 140
    # where to draw main pics
    config['PIC_COORDS'] = [{'x': 14, 'y': 5},
                            {'x': 24, 'y': 174},
                            {'x': 24, 'y': 336}]
    # where to draw choice numbers
    config['TEXTBOX_COORDS'] = [{'x': 190, 'y': 10},
                                {'x': 190, 'y': 174},
                                {'x': 190, 'y': 336}]

    config['BOX_WIDTH'] = 30
    config['font1'] = font_dict[16]
    config['font2'] = font_dict[13]

    if origin is 'facebook':
        config['BOX_WIDTH'] = 22
        config['CHAT_HEIGHT'] = 223
        config['CHAT_WIDTH'] = 425
        config['PIC_COORDS'] = [{'x': 5, 'y': 5}]  # where to draw main pics
        # where to draw text boxes
        config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 5}]
        config['PIC_SIZE'] = 223, 223
        config['font1'] = font_dict[28]
        config['font2'] = font_dict[20]

    if origin is 'skype':
        config['BOX_WIDTH'] = 22
        config['CHAT_HEIGHT'] = 230
        config['CHAT_WIDTH'] = 381
        config['PIC_COORDS'] = [{'x': 20, 'y': 50}]  # where to draw main pics
        # where to draw text boxes
        config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 100}]
        config['PIC_SIZE'] = 250, 250
        config['font1'] = font_dict[28]
        config['font2'] = font_dict[20]

    return config
