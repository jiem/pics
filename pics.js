var fs = require('fs');
var child_process = require('child_process');
var ProgressBar = require('progress');
var path = require('path');
var argv = require('optimist').argv;

//==============================================================================
function stat(img, cb) {  
  var cmd = 'gm identify -ping -format "%w %h %b" ' + img;
  child_process.exec(cmd, function(err, stdout, stderr) {      
    if (err || stderr) {
      cb(err || new Error(stderr));
    } else {                
      cb(null, /^(\d+)\s(\d+)\s(\d+)/.test(stdout) ? {
        width: parseInt(RegExp.$1),
        height: parseInt(RegExp.$2),
        size: parseInt(RegExp.$3),
        file: path.resolve(img)
      } : null);        
    }
  });
}

//==============================================================================
function resize(img, w, h, out, cb) {
  var cmd = 'gm  convert -geometry ' + w + 'x' + h + ' ' + img + ' ' + out;
  child_process.exec(cmd, function(err, _, stderr) {      
    cb(err || stderr ? new Error(stderr.trim()) : null);    
  });  
}

//==============================================================================
function logoize(img, logo, pos, out, cb) {
  
  var direction = 'SouthEast';
  var hMargin = 0;
  var vMargin = 0;
  var geometry, cmd;
  
  pos || (pos = {});
  
  if (typeof pos.top === 'number') {
    vMargin = pos.top;
    if (typeof pos.left === 'number') {
      direction = 'NorthWest';    
      hMargin = pos.left;    
    } else if (typeof pos.right === 'number') {
      direction = 'NorthEast';      
      hMargin = pos.right;    
    } else {
      direction = 'North';
    }    
  }
  
  if (typeof pos.bottom === 'number') {
    vMargin = pos.bottom;
    if (typeof pos.left === 'number') {
      direction = 'SouthWest';    
      hMargin = pos.left;    
    } else if (typeof pos.right === 'number') {
      direction = 'SouthEast';      
      hMargin = pos.right;    
    } else {
      direction = 'South';
    }    
  }
  
  if (pos.center) {
    direction = 'Center';
  }
  
  geometry = direction !== 'Center' ? '-geometry +' 
    + hMargin + '+' + vMargin + ' ' : '';  
  cmd = 'gm composite -gravity ' + direction + ' ' + geometry 
    + logo + ' ' + img + ' ' + out;
  
  child_process.exec(cmd, function(err, _, stderr) {
    cb(err || stderr ? new Error(stderr.trim()) : null);    
  });
  
}

//==============================================================================
function statDir(dir, cb) {
  fs.readdir(dir, function(err, files) {
    var nbIdentified = 0;
    var images = [];
    var size = 0;
    var nbFiles, i;
    if (err) {
      cb(err);
    } else {
      nbFiles = files.length;
      for (i = 0; i < nbFiles; i++) {
        stat(path.join(dir, files[i]), function(_, stat) { 
          if (stat) {
            images.push(stat);
            size += stat.size;
          }
          if (++nbIdentified === nbFiles)
            cb(null, {images: images, size: size});        
        })
      }  
    }        
  });
}

//==============================================================================
function resizeDir(dir, maxWidth, maxHeight, outDir, cb) {
  
  statDir(dir, function(err, stat) {
    
    var imgObjs = stat.images;
    var nbImages = imgObjs.length;        
    var i = -1;
    var bar = new ProgressBar('Resizing [:bar] :percent', {
      complete: '=', 
      incomplete: ' ', 
      width: 20, 
      total: stat.size
    });
        
    function resizeNext(err) {    
      var img, out;
      if (++i) {
        img = imgObjs[i - 1];
        bar.tick(img.size);
        if (i === nbImages) {
          bar.tick(1);
          console.log(' completed!')
        }
        cb && cb(err, i === nbImages, img);
      }
      if (i < nbImages) {      
        img = imgObjs[i];
        out = path.join(outDir, path.basename(img.file));
        resize(img.file, maxWidth, maxHeight, out, resizeNext);  
      }    
    }
    
    if (err) {
      cb(err);
    } else {
      resizeNext();
    }
  });
  
}

//==============================================================================
function logoizeDir(dir, logo, pos, outDir, cb) {

  statDir(dir, function(err, stat) {
    
    var imgObjs = stat.images;
    var nbImages = imgObjs.length;        
    var i = -1;
    var bar = new ProgressBar('Logoizing [:bar] :percent', {
      complete: '=', 
      incomplete: ' ', 
      width: 20, 
      total: stat.size
    });
        
    function logoizeNext(err) {    
      var img, out;
      if (++i) {
        img = imgObjs[i - 1];
        bar.tick(img.size);
        if (i === nbImages) {
          bar.tick(1);
          console.log(' completed!')
        }
        cb && cb(err, i === nbImages, img);
      }
      if (i < nbImages) {      
        img = imgObjs[i];
        out = path.join(outDir, path.basename(img.file));
        logoize(img.file, logo, pos, out, logoizeNext);  
      }    
    }
    
    if (err) {
      cb(err);
    } else {
      logoizeNext();
    }
  });
  
}

//==============================================================================
function resizeCmd() {
  var maxWidth = parseInt(process.argv[3]);
  var maxHeight = parseInt(process.argv[4]);
  var dir = process.argv[5];
  var outDir = process.argv[6] || dir;
  resizeDir(dir, maxWidth, maxHeight, outDir);
}

//==============================================================================
function logoizeCmd() {
  var logo = process.argv[3];
  var dir = process.argv[4];
  var outDir = process.argv[5] || dir;
  var pos = {
    top: argv.top, 
    right: argv.right, 
    bottom: argv.bottom,
    left: argv.left,
    center: argv.center
  }
  logoizeDir(dir, logo, pos, outDir);
}

//==============================================================================
function main() {
  switch (process.argv[2]) {
    case 'resize': resizeCmd(); break;
    case 'logoize': logoizeCmd(); break;      
  }
}

//==============================================================================
main();

/*
function resize(image, maxWidth, maxHeight, out, cb) {
  var x = image.width;
  var y = image.height;
  if (x > maxWidth) {
    maxWidth * y / x > maxHeight ?
      gm(image.file).resize(maxHeight * x / y, maxHeight).write(out, cb) :
      gm(image.file).resize(maxWidth, maxWidth * y / x).write(out, cb);      
  } else if (y > maxHeight) {
    gm(image.file).resize(maxHeight * x / y, maxHeight).write(out, cb);
  } else {
    cb();
  }
}*/