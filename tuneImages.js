
let System = require('dw/system/System');
let ProductMgr = require('dw/catalog/ProductMgr');
let CatalogMgr = require('dw/catalog/CatalogMgr');
let File = require('dw/io/File');
let FileWriter = require('dw/io/FileWriter');
let XMLStreamWriter = require('dw/io/XMLStreamWriter');
let Transaction = require('dw/system/Transaction');
let Logger = require('dw/system').Logger.getLogger('tuneImage', '')



function tuneImages() {      
            var catalog=CatalogMgr.getCatalog('storefront-catalog-mudbay-en');
            var impexBasePath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'feeds' + File.SEPARATOR + 'salsify';
            var filew = new File(impexBasePath + File.SEPARATOR + 'storefront-images.xml');
            var fileWriter : FileWriter = new FileWriter(filew, "UTF-8");
            var xsw : XMLStreamWriter = new XMLStreamWriter(fileWriter);

            
            checkDirs();

            var startDocument = function(xsw){
                xsw.writeStartDocument("UTF-8", "1.0");	
            }
            var endDocument = function(xsw){
                xsw.writeEndDocument();	
            }
            
            var catalogStart = function(xsw){
                xsw.writeStartElement("catalog");
                    xsw.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
                    xsw.writeAttribute("catalog-id", "mudbay-m-catalog");
                    
            }
            var catalogEnd = function(xsw){
                xsw.writeEndElement();	
            }
            
            var addHeader = function(xsw){
                xsw.writeStartElement("header");
                    xsw.writeStartElement("image-settings");
                        xsw.writeStartElement("internal-location");
                        xsw.writeAttribute("base-path", "/images");
                        xsw.writeEndElement();	
                            xsw.writeStartElement("view-types");
                                
                                xsw.writeStartElement("view-type");
                                       xsw.writeCharacters("hi-res");
                                xsw.writeEndElement();
                                
                                xsw.writeStartElement("view-type");
                                xsw.writeCharacters("large");
                                xsw.writeEndElement();

                                xsw.writeStartElement("view-type");
                                       xsw.writeCharacters("medium");
                                   xsw.writeEndElement();
                                   
                                   xsw.writeStartElement("view-type");
                                       xsw.writeCharacters("small");
                                   xsw.writeEndElement();
                                   
                               xsw.writeEndElement();
                               
                        
                    xsw.writeEndElement();
                xsw.writeEndElement();	
            }
            catalogStart(xsw);
            addHeader(xsw);
            

            var count=0;
            var category="";
            var pid="";

            var allProducts=ProductMgr.queryProductsInCatalog(catalog);

            while (allProducts.hasNext())
                {

                //count=count+1;
                if (count>120) {
                    xsw.writeEndDocument();
                    xsw.close();
                    fileWriter.close();

                    break;
                }
                try {
                    var product=allProducts.next()
                    pid=product.ID;

                    if (product.variant) {
                        processProductVariant(product,xsw);
                    }
                    if (product.master) {
                        processProductMaster(product,xsw);
                    }                  
                    if (product.master==false && product.variant==false) {
                        processProduct(product,xsw);
                    }
                        

                }
                catch (ex){
   
                }

            }
        
                xsw.writeEndDocument();
                xsw.close();
                fileWriter.close();
  

}


function checkDirs(){
    var archiveFolder = new File(File.CATALOGS + File.SEPARATOR + 'mudbay-m-catalog' + File.SEPARATOR + 'default' + File.SEPARATOR + 'images' + File.SEPARATOR + 'hi-res');
	if (!archiveFolder.exists()) {
		archiveFolder.mkdirs();
	}
}

function processProductVariant(product,xsw){
    xsw.writeStartElement("product");
    xsw.writeAttribute("product-id", product.ID);
    xsw.writeStartElement("images");
  
    xsw.writeEndElement(); 
    xsw.writeEndElement();

}

function processProductMaster(product,xsw){
    xsw.writeStartElement("product");
    xsw.writeAttribute("product-id", product.ID);
    xsw.writeStartElement("images");
    //Clean up Large data
    xsw.writeStartElement("image-group");
    xsw.writeAttribute("view-type", "large");
    xsw.writeEndElement(); 
    var c=0;
    var first=true;

    for each(var variant in product.variants){
        //GET IMAGES FOR MASTER
        if (first){  
            first=false;
            xsw.writeStartElement("image-group");
            xsw.writeAttribute("view-type", "hi-res");
            try {
                if (variant.custom["primary-image"]){
                    c=c+1;
                    getFiles(variant.custom["primary-image"],variant.ID,c,xsw); 
                }
            }
            catch (ex){}
    
            //Secondary
    
            try {
                    if (variant.custom["additional-images"] ){
                        var imgs=product.custom["additional-images"];
    
                        if (imgs[0] && imgs[0].toString().indexOf('Ljava')==-1){
                        
                            for each(var imgline in imgs){
                                for each(var img in imgline.split(';')){
                                    c=c+1;
                                    getFiles(img,variant.ID,c,xsw);
                                }
                                
                            }
    
                        }
                    }
                }
    
                catch (ex){}
                xsw.writeEndElement();     

        }


        if (variant.custom.size){
            var vv=variant.custom.size;
        }
        else {
            var vv=variant.ID;
        }
        xsw.writeStartElement("image-group");
        xsw.writeAttribute("view-type", "hi-res");
        //Adjustments for new variation attribute format -Cody C. 7/4/2022
        //xsw.writeAttribute("variation-value", vv); Removed line
        xsw.writeStartElement("variation"); //added line
        xsw.writeAttribute("attribute-id", "size"); //added line
        xsw.writeAttribute("value", vv); //added line


        //Primary

        try {
            if (variant.custom["primary-image"]){
                c=c+1;
                getFiles(variant.custom["primary-image"],variant.ID,c,xsw); 
            }
        }
        catch (ex){}

        //Secondary

        try {
                if (variant.custom["additional-images"] ){
                    var imgs=product.custom["additional-images"];

                    if (imgs[0] && imgs[0].toString().indexOf('Ljava')==-1){
                    
                        for each(var imgline in imgs){
                            for each(var img in imgline.split(';')){
                                c=c+1;
                                getFiles(img,variant.ID,c,xsw);
                            }
                            
                        }

                    }
                }
            }

            catch (ex){}
            xsw.writeEndElement(); //added line to close variation element
            xsw.writeEndElement(); 
    }
    
    xsw.writeEndElement();
    xsw.writeEndElement();

}


function processProduct(product,xsw){

    xsw.writeStartElement("product");
    xsw.writeAttribute("product-id", product.ID);
    xsw.writeStartElement("images");
    //Clean up large data
    xsw.writeStartElement("image-group");
    xsw.writeAttribute("view-type", "large");
    xsw.writeEndElement(); 
    
    xsw.writeStartElement("image-group");
    xsw.writeAttribute("view-type", "hi-res");
    var c=0;


    //Primary

    try {
        if (product.custom["primary-image"]){
            c=c+1;
            getFiles(product.custom["primary-image"],product.ID,c,xsw); 
        }
    }
    catch (ex){

        Logger.error('Exception: '+product.ID);
        
    }

   //Secondary

   try {
        if (product.custom["additional-images"] ){
            var imgs=product.custom["additional-images"];

            if (imgs[0] && imgs[0].toString().indexOf('Ljava')==-1){
            
                for each(var imgline in imgs){
                    for each(var img in imgline.split(';')){
                        c=c+1;
                        getFiles(img,product.ID,c,xsw);
                    }
                    
                }

            }
        }
    }

    catch (ex){}

    xsw.writeEndElement(); 
    xsw.writeEndElement();
    xsw.writeEndElement();

}


function getFiles(imgurl,productID,c,xsw2) {

    if (System.getInstanceType()==System.DEVELOPMENT_SYSTEM){
        var product=ProductMgr.getProduct(productID);
        try {
            if (product.custom.animal=='Cat'){
            }
            else{
                imgurl='https://evaluplus.com/wp-content/plugins/all-in-one-video-gallery/public/assets/images/placeholder-image.png';
            }
        }
        catch (ex){}

       
    }
    var lastindex=imgurl.toString().lastIndexOf('.');
    var extension=imgurl.substring(lastindex);
    let HTTPClient = require('dw/net/HTTPClient')
    let File = require('dw/io/File');
    var httpClient : HTTPClient = new HTTPClient();
    var impexBasePath = File.CATALOGS + File.SEPARATOR + 'mudbay-m-catalog' + File.SEPARATOR + 'default' + File.SEPARATOR + 'images' + File.SEPARATOR + 'hi-res';
    var filew = new File(impexBasePath + File.SEPARATOR +productID+'-'+c.toString()+extension);

 
        xsw2.writeStartElement("image");
        xsw2.writeAttribute("path", "hi-res/"+productID+'-'+c.toString()+extension);
        xsw2.writeEndElement();
        if (filew.exists()){
            return;
        }

    httpClient.open('GET', imgurl);
    httpClient.setTimeout(30000);
    httpClient.send();
    
    if (httpClient.statusCode == 200) {
            httpClient.sendAndReceiveToFile(filew);
            xsw2.writeStartElement("image");
			xsw2.writeAttribute("path", "hi-res/"+productID+'-'+c.toString()+extension);
			xsw2.writeEndElement();
    }
   
            

}

tuneImages.public = true;
module.exports.tuneImages = tuneImages;