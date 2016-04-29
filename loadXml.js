/*
Description:
	Function takes a string argument of file path/name and loads XML.
	XML is parsed into DOM object using DOMParser class.

Note:
	Path begins in root directory of project.

Example:
	loadXML('data/exampleDataFile.xml')
 */
function loadXML (fileName) {

	var xml = new XMLHttpRequest();
	xml.open('GET', fileName, false);
	xml.send();
	var xmlData = xml.responseXML;
	
	if(!xmlData){
		var parser = new DOMParser();
		xmlData = parser.parseFromString(xml.responseText,"text/xml");
	}
	
	return xmlData;
}

