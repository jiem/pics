# Resize and add logo to all your pictures at once

This is the script we use after each [DrinkEntrepreneurs][0] to resize and add our logo to all the pictures of the event.
The script requires GraphicsMagick and nodeJS. It runs on Linux and should also work on MacOS.

## Usage

Put a directory `photos` in the same directory as the script and run `./process.sh`.   
The directories `photos_en` and `photos_cn` will be created with images resized (maxWidth 1920, maxHeight 1280) and logoized.


[0]: http://shanghai.drinkentrepreneurs.com/