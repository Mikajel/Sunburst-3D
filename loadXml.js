/*function loadXmlData(dataset) {

	this.data = Tree(dataset);
	
	var actual = data._root;
	var depth = 0;
	var latin;
	var english;
	var child;
	var line;

	line = loadNextLine();
	while(mameriadky a depth >= 0)

		if(branch){
			depth += 1;
		}

		if(\branch){
			depth -= 1;
		}

		if(leaf){
			child.latin = parseNextLine();
			child.english = parseNextLine();
			actual.children.push(child);
		}

		if(\leaf){
			nothing;
		}


		line = loadNextLine();
}*/

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

