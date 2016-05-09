var ImagePlugin = Plugin.extend({
    _type: 'image',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
        var asset = '';
        if(data.asset) {
            asset = data.asset;
        } else if (data.model) {
            asset = this._stage.getModelValue(data.model);
        } else if (data.param) {
            asset = this.getParam(data.param);
        }
        if(_.isEmpty(asset)) {
            this._render = false;
            console.warn("ImagePlugin: Asset not found", data);
        } else {
            var assetSrc = this._theme.getAsset(asset);

            var img;
            if(_.isString(assetSrc)){
                img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = assetSrc;
            }else{
                img = assetSrc;
            }
            var s = new createjs.Bitmap(img);
            this._self = s;

            var dims = this.relativeDims();

            // Align the image in its container
            var xd = dims.x;
            dims = this.alignDims();
            s.x = dims.x;
            s.y = dims.y;
            if(_.isString(assetSrc)){
                //console.log("ImagePlugin: Image is not present in loaders. So loading asset.");
                AssetManager.strategy.loadAsset(this._stage._data.id, data.asset, assetSrc, function(){
                    if(_.isString(instance._self)){
                        //console.log("ImagePlugin: Image load failed", assetSrc);
                    }
                    //console.log("ImagePlugin: Asset loaded", assetSrc);
                    var s = instance._self;
                    var dims = instance.relativeDims();
                    var sb = s.getBounds();
                    s.x = dims.x;
                    s.y = dims.y;
                    var sb = s.getBounds();
                    if(sb) {                    
                        instance.setScale(); 
                    }
                    instance._theme.update();
                    //Renderer.update = true;
                });                
            }else{
                var sb = s.getBounds();
                if(sb) {
                    this.setScale();
                }
            }
        }        
    },
    alignDims: function() {
        console.log(this._parent);
        var parentDims = this._parent.dimensions();
        var dims = this._dimensions;

        // Alignment of the image in its parent container
        var align  = (this._data.align ? this._data.align.toLowerCase() : "");
        var valign = (this._data.valign ? this._data.valign.toLowerCase() : "");

        if (align == "left") dims.x = 0;
        else if (align == "right") dims.x = (parentDims.w - dims.w);
        else if (align == "center") dims.x = ((parentDims.w - dims.w)/2);

        if (valign == "top") dims.y = 0;
        else if (valign == "bottom") dims.y = (parentDims.h - dims.h);
        else if (valign == "middle") dims.y = ((parentDims.h - dims.h)/2);

        return this._dimensions;
    },
    refresh: function() {
        var asset = '';
        if (this._data.model) {
            asset = this._stage.getModelValue(this._data.model);   
        } else if (this._data.param) {
            asset = this.getParam(this._data.param);
        } else {
            asset = this._data.asset;
        }
        if (asset) {
            var image = this._theme.getAsset(asset);
            this._self.image = image;
            Renderer.update = true;
        }
    },
});
PluginManager.registerPlugin('image', ImagePlugin);