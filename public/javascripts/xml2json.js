    function getXmlDOM(xmlval)  {
        var xmlDoc = null;
        if(window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc= parser.parseFromString(xmlval,"text/xml");
            return xmlDoc;
        } else if(window.ActiveXObject) {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlval);
            return xmlDoc;
        } else {
            alert("XML 문자열로부터 XML DOM을 만들 수 없습니다.");
            return null;
        }
    }