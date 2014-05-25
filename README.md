# Resize and add logo to all your pictures at once

This is the script we use after each [DrinkEntrepreneurs][0] to resize and add our logo to all the pictures of the event.
The script requires GraphicsMagick and NodeJS. It runs on Linux and MacOS.

## Usage
Install GraphicsMagick.  
Install NodeJS.  
Install the packages by running `npm install` in the same directory.  
Put a directory `photos` in the same directory as the script and run `./process` in a terminal (or click on it).   
The directories `photos_en` and `photos_cn` will be created with images resized (maxWidth 1920, maxHeight 1280) and logoized.


[0]: http://shanghai.drinkentrepreneurs.com/