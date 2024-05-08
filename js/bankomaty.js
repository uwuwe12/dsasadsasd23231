"use strict";

var mapa;
var punktTabela;
var punktWybrany;
var punktMojaPozycja;
var serwisUrl;
var serwisJezyk;
var mapaId;
punktTabela=[];
punktWybrany=0;
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
{
 //mapaId = 'e2ce6e4e18037ffe';
 mapaId = 'a0779adbf8066dd5';
}
else
{
 mapaId = 'a0779adbf8066dd5';
}

function mapaPokaz()
{
 mapa=new google.maps.Map(document.getElementById('mapa-mapa'),{center:{lat:52.0,lng:18.8},zoom:6,mapId:mapaId});
 mapa.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('mapa-element-lt'));
 google.maps.event.addListener(mapa,'idle',function(){punktWczytaj();});
 google.maps.event.addListener(mapa,'tilesloaded',function(){setTimeout(function(){document.getElementById('mapa-element-lt').style.display='inline';},1000);});
 mapaPoczatek();
}

function mapaPozycja()
{
 var mojaPozycja;
 var xmlUrl;
 if(navigator.geolocation)
 {
  navigator.geolocation.getCurrentPosition(function(mojaPozycja)
  {
   if(punktMojaPozycja)
   {
    punktMojaPozycja.setMap(null);
   }
   mojaPozycja={lat:mojaPozycja.coords.latitude,lng:mojaPozycja.coords.longitude};
   punktMojaPozycja=new google.maps.Marker({position:mojaPozycja,map:mapa,title:'',icon:serwisUrl+'images/bluedot.png'});
   xmlUrl=serwisUrl+serwisJezyk+'/xhr/g,'+mojaPozycja.lat.toFixed(5)+','+mojaPozycja.lng.toFixed(5)+','+mapa.getZoom();
   jQuery.ajax(xmlUrl,{success:function(){},error:function(jqXHR){if(jqXHR.status>0){window.location.replace(serwisUrl+'error/'+jqXHR.status);}}});
   mapa.setCenter(mojaPozycja);
   mapa.setZoom(18);
  });
 }
}

function punktWczytaj()
{
 var mapaPozycjaSW;
 var mapaPozycjaNE;
 var punktInfo;
 var punktNumer;
 var xmlUrl;
 var xmlWynik;
 var xmlInfo;
 var xmlPunkt;
 var punktId;
 var punktNowy;
 var punktMarker;
 var punktPozycja;
 var punktIkona;
 var punktOpis;
 var punktBankId;
 var punktDepozytId;
 mapaPozycjaSW=mapa.getBounds().getSouthWest();
 mapaPozycjaNE=mapa.getBounds().getNorthEast();
 punktInfo=new google.maps.InfoWindow();
 for (punktNumer=0;punktNumer<punktTabela.length;punktNumer++)
 {
  punktTabela[punktNumer].punktWidoczny=false;
 }
 xmlUrl=serwisUrl+serwisJezyk+'/xhr/m,'+mapaPozycjaSW.lat().toFixed(5)+','+mapaPozycjaSW.lng().toFixed(5)+','+mapaPozycjaNE.lat().toFixed(5)+','+mapaPozycjaNE.lng().toFixed(5)+','+mapa.getZoom();
 jQuery.ajax(xmlUrl,{success:function(xmlWynik)
 {
  jQuery(xmlWynik).find('info').each(function()
  {
   xmlInfo=jQuery(this);
   document.getElementById('mapa-info').innerHTML=xmlInfo.attr('text');
   if(xmlInfo.attr('text').length>0)
   {
    document.getElementById('mapa-info').style.display='inline';
   }
   else
   {
    document.getElementById('mapa-info').style.display='none';
   }
  });
  jQuery(xmlWynik).find('punkt').each(function()
  {
   document.getElementById('mapa-info').style.display='none';
   xmlPunkt=jQuery(this);
   punktId=xmlPunkt.attr('id');
   punktNowy=true;
   for (punktNumer=0;punktNumer<punktTabela.length;punktNumer++)
   {
    if(punktTabela[punktNumer].punktId==punktId)
    {
     punktTabela[punktNumer].punktWidoczny=true;
     punktNowy=false;
     break;
    }                
   }
   if(punktNowy)
   {
    punktPozycja={lat:parseFloat(xmlPunkt.attr('lt')),lng: parseFloat(xmlPunkt.attr('ln'))};
    punktIkona={url:serwisUrl+'images/punkt_ikona.png',size:new google.maps.Size(52,40),origin:new google.maps.Point(xmlPunkt.attr('ik').split(',')[0],xmlPunkt.attr('ik').split(',')[1]),anchor:new google.maps.Point(Number(xmlPunkt.attr('ik').split(',')[2]),Number(xmlPunkt.attr('ik').split(',')[3]))};
    punktMarker=new google.maps.Marker({position:punktPozycja,map:mapa,icon:punktIkona,title:xmlPunkt.attr('tt'),punktId:xmlPunkt.attr('id'),punktOpis:xmlPunkt.attr('op'),punktWidoczny:true,punktBankId:xmlPunkt.attr('bx'),punktDepozytId:xmlPunkt.attr('dx'),punktBankWidoczny:true,punktDepozytWidoczny:true});
    punktNumer=punktTabela.push(punktMarker);
    if(punktWybrany==punktId)
    {
     punktInfo.setContent(punktMarker.punktOpis);
     punktInfo.open(mapa,punktMarker);
    } 
    google.maps.event.addListener(punktMarker,'click',function()
    {
     punktInfo.close(mapa,this);
     punktInfo.setContent(this.punktOpis);
     punktInfo.open(mapa,this);
    });
   }
  });
  punktNumer=0;
  while (punktNumer<punktTabela.length)
  {
   if(!punktTabela[punktNumer].punktWidoczny)
   {
    punktTabela[punktNumer].setMap(null);
    punktTabela.splice(punktNumer,1); 
   }
   else
   {
    punktNumer++;
   }
  }
  punktFiltr();   
 },error:function(jqXHR){if(jqXHR.status>0){window.location.replace(serwisUrl+'error/'+jqXHR.status);}}});
}

function punktFiltr()
{
 var punktNumer;
 var punktDepozytId;
 var punktBankId;
 punktNumer=0;
 while (punktNumer<punktTabela.length)
 {
  punktDepozytId=punktTabela[punktNumer].punktDepozytId;
  punktBankId=punktTabela[punktNumer].punktBankId;
  punktTabela[punktNumer].punktDepozytWidoczny=true;
  punktTabela[punktNumer].punktBankWidoczny=true;
  if(document.getElementById(punktBankId).checked==false)
  {
   punktTabela[punktNumer].punktBankWidoczny=false;
  }
  if(document.getElementById('d1').checked==false)
  {
   if(document.getElementById('d2').checked==false)
   {
    punktTabela[punktNumer].punktDepozytWidoczny=false;
   }
   else
   {
    if(punktDepozytId=='d1')
    {
     punktTabela[punktNumer].punktDepozytWidoczny=false;
    }
   }
  }
  else
  {
   if(document.getElementById('d2').checked==false)
   {
    if(punktDepozytId=='d3')
    {
     punktTabela[punktNumer].punktDepozytWidoczny=false;
    }
   }
  }
  if(punktTabela[punktNumer].punktBankWidoczny==true && punktTabela[punktNumer].punktDepozytWidoczny==true)
  {
   punktTabela[punktNumer].setMap(mapa);
  }
  else
  {
   punktTabela[punktNumer].setMap(null);
  }
  punktNumer++;
 }
 punktFiltrPokaz();
}

function punktFiltrPokaz()
{
 var checkNumer;
 var checkTabela;
 var filtrZalozony;
 filtrZalozony=false;
 checkTabela=[];
 checkTabela.push(document.getElementById('d1'));
 checkTabela.push(document.getElementById('d2'));
 checkTabela.push(document.getElementById('b1'));
 checkTabela.push(document.getElementById('b2'));
 checkTabela.push(document.getElementById('b3'));
 checkTabela.push(document.getElementById('b4'));
 checkTabela.push(document.getElementById('b7'));
 checkTabela.push(document.getElementById('b8'));
 checkTabela.push(document.getElementById('b9'));
 checkTabela.push(document.getElementById('b18'));
 checkTabela.push(document.getElementById('b19'));
 checkTabela.push(document.getElementById('b22'));
 checkTabela.push(document.getElementById('b24'));
 checkTabela.push(document.getElementById('b25'));
 checkTabela.push(document.getElementById('b26'));
 checkNumer=0;
 while (checkNumer<checkTabela.length)
 {
  if(checkTabela[checkNumer].checked==false)
  {
   filtrZalozony=true;
  }
  checkNumer++;
 }
 if(filtrZalozony==true)
 {
  document.getElementById('filtr-zawartosc').className='mdl-badge mdl-badge--overlap';
  document.getElementById('filtr-zawartosc').setAttribute('data-badge','✔');
 }
 else
 {
  document.getElementById('filtr-zawartosc').className='';
  document.getElementById('filtr-zawartosc').setAttribute('data-badge','✔'); 
 }
}

function punktFiltrBankAll()
{
 var checkNumer;
 var checkTabela;
 checkTabela=[];
 checkTabela.push(document.getElementById('b1'));
 checkTabela.push(document.getElementById('b2'));
 checkTabela.push(document.getElementById('b3'));
 checkTabela.push(document.getElementById('b4'));
 checkTabela.push(document.getElementById('b7'));
 checkTabela.push(document.getElementById('b8'));
 checkTabela.push(document.getElementById('b9'));
 checkTabela.push(document.getElementById('b18'));
 checkTabela.push(document.getElementById('b19'));
 checkTabela.push(document.getElementById('b22'));
 checkTabela.push(document.getElementById('b24'));
 checkTabela.push(document.getElementById('b25'));
 checkTabela.push(document.getElementById('b26'));
 checkNumer=0;
 while (checkNumer<checkTabela.length)
 {
  if(document.getElementById('b0').checked==false)
  {
   checkTabela[checkNumer].parentElement.MaterialSwitch.off();
  }
  else
  {
   checkTabela[checkNumer].parentElement.MaterialSwitch.on();
  }
  checkNumer++;
 }
 punktFiltr();
}

function linkKopiuj(linkUrl,linkInfo)
{
 var infoBar;
 navigator.clipboard.writeText(linkUrl);
 infoBar=document.querySelector('.mdl-js-snackbar');
 infoBar.MaterialSnackbar.showSnackbar({message:linkInfo,timeout:1000}); 
}

function kartaPrzelacz(kartaId)
{
 var tablica;
 var tablicaNumer;
 tablica=[1,2,3,4];
 tablica.forEach(function(tablicaNumer)
 {
  document.getElementById('tab'+tablicaNumer).classList.remove('is-active');
  document.getElementById('mtab'+tablicaNumer).classList.remove('is-active');
 });
 document.getElementById('tab'+kartaId).classList.add('is-active');
 document.getElementById('mtab'+kartaId).classList.add('is-active');
}

function mapaPokazPunkt(punktId,mapaPozycja,przelaczKarte)
{
 mapa.setCenter(mapaPozycja); 
 mapa.setZoom(18);
 punktWybrany=punktId;
 if(przelaczKarte==true)
 {
  kartaPrzelacz(1);
  punktWczytaj();
 }
}

function mapaPokazObszar(mapaObszar,przelaczKarte)
{
 if(przelaczKarte==true)
 {
  kartaPrzelacz(1);
 }
 mapa.fitBounds(mapaObszar);
 mapa.setZoom(15);
}

function kartaPunkt(punktId)
{
 var xmlUrl;
 var xmlWynik;
 var xmlHtml;
 document.getElementById('karta-punkt').innerHTML='';
 stronaElementPokaz('karta-punkt-class','none');
 xmlUrl=serwisUrl+serwisJezyk+'/xhr/p,'+punktId; 
 jQuery.ajax(xmlUrl,{success:function(xmlWynik)
 {
  jQuery(xmlWynik).find('opis').each(function()
  {
   xmlHtml=jQuery(this);
   stronaElementPokaz('karta-miejscowosc-class','none');
   stronaElementPokaz('szukaj-sugestia-class','none');
   stronaElementPokaz('szukaj-info-class','none');
   stronaElementPokaz('szukaj-wyniki-class','none');
   stronaElementPokaz('karta-punkt-class','inline');
   document.getElementById('karta-punkt').innerHTML=xmlHtml.attr('html');
   kartaPrzelacz(3);
  });
  jQuery(xmlWynik).find('info').each(function()
  {
   xmlSzukaj=jQuery(this);
   if(xmlSzukaj.attr('text').length>0)
   { 
    stronaElementPokaz('szukaj-info-class','inline');
    document.getElementById('szukaj-info').innerHTML=xmlSzukaj.attr('text');
   }
  });
 },error:function(jqXHR){if(jqXHR.status>0){window.location.replace(serwisUrl+'error/'+jqXHR.status);}}});
}

function kartaZamknij()
{
 stronaElementPokaz('karta-miejscowosc-class','none');
 stronaElementPokaz('karta-punkt-class','none');
 if(document.getElementById('szukaj-sugestia').innerHTML.length>0)
 {
  stronaElementPokaz('szukaj-sugestia-class','inline');
 }
 if(document.getElementById('szukaj-info').innerHTML.length>0)
 {
  stronaElementPokaz('szukaj-info-class','inline');
 }
 if(document.getElementById('szukaj-wyniki-L').innerHTML.length>0 && document.getElementById('szukaj-wyniki-P').innerHTML.length>0)
 {
  stronaElementPokaz('szukaj-wyniki-class','inline');
 }
}

function kartaMiejscowosc(miejscowoscId)
{
 var xmlUrl;
 var xmlWynik;
 var xmlHtml;
 document.getElementById('karta-miejscowosc').innerHTML='';
 stronaElementPokaz('karta-miejscowosc-class','none');
 xmlUrl=serwisUrl+serwisJezyk+'/xhr/l,'+miejscowoscId; 
 jQuery.ajax(xmlUrl,{success:function(xmlWynik)
 {
  jQuery(xmlWynik).find('opis').each(function()
  {
   xmlHtml=jQuery(this);
   stronaElementPokaz('karta-punkt-class','none');
   stronaElementPokaz('szukaj-sugestia-class','none');
   stronaElementPokaz('szukaj-info-class','none');
   stronaElementPokaz('szukaj-wyniki-class','none');
   stronaElementPokaz('karta-miejscowosc-class','inline');
   document.getElementById('karta-miejscowosc').innerHTML=xmlHtml.attr('html');
   kartaPrzelacz(3);
  });
  jQuery(xmlWynik).find('info').each(function()
  {
   xmlSzukaj=jQuery(this);
   if(xmlSzukaj.attr('text').length>0)
   { 
    stronaElementPokaz('szukaj-info-class','inline');
    document.getElementById('szukaj-info').innerHTML=xmlSzukaj.attr('text');
   }
  });
 },error:function(jqXHR){if(jqXHR.status>0){window.location.replace(serwisUrl+'error/'+jqXHR.status);}}});
}

function stronaElementPokaz(klasaNazwa,klasaWartosc)
{
 var pozycja;
 var elementTabela;
 elementTabela=document.getElementsByClassName(klasaNazwa);
 for (pozycja=0;pozycja<elementTabela.length;pozycja++)
 {
  if(klasaNazwa=='szukaj-postep-class')
  {
   elementTabela[pozycja].style.visibility=klasaWartosc;
  }
  else
  {
   elementTabela[pozycja].style.display=klasaWartosc;
  }
 } 
}

function stronaSzukaj()
{
	var szukajWyrazenie;
	var szukajFiltr;
	var xmlUrl;
	var xmlWynik;
	var xmlSzukaj;
	var checkTabela;
	var checkNumer;
	szukajWyrazenie=document.getElementById('szukaj-wyrazenie').value;
	if(szukajWyrazenie.length<1)
	{
		return false;
	}
	checkTabela=[];
	checkTabela.push('d1');
	checkTabela.push('d2');
	checkTabela.push('b1');
	checkTabela.push('b2');
	checkTabela.push('b3');
	checkTabela.push('b4');
	checkTabela.push('b7');
	checkTabela.push('b8');
	checkTabela.push('b9');
	checkTabela.push('b18');
	checkTabela.push('b19');
	checkTabela.push('b22');
	checkTabela.push('b24');
	checkTabela.push('b25');
	checkTabela.push('b26');
	checkNumer=0;
	szukajFiltr='';
	stronaElementPokaz('szukaj-postep-class','visible');
	stronaElementPokaz('karta-punkt-class','none');
	stronaElementPokaz('karta-miejscowosc-class','none');
	stronaElementPokaz('szukaj-sugestia-class','none');
	stronaElementPokaz('szukaj-info-class','none');
	stronaElementPokaz('szukaj-wyniki-class','none');
	document.getElementById('karta-punkt').innerHTML='';
	document.getElementById('karta-miejscowosc').innerHTML='';
	document.getElementById('szukaj-sugestia').innerHTML='';
	document.getElementById('szukaj-info').innerHTML='';
	document.getElementById('szukaj-wyniki-L').innerHTML='';
	document.getElementById('szukaj-wyniki-P').innerHTML='';
	while(checkNumer<checkTabela.length)
	{
	if(document.getElementById(checkTabela[checkNumer]).checked==false)
	{
		szukajFiltr=szukajFiltr.concat(checkTabela[checkNumer]+':');
	}
	checkNumer++;  
	}
	szukajFiltr=szukajFiltr.replace(/:$/,'');
	szukajWyrazenie=szukajWyrazenie.replace(/,/g,'+');
    szukajWyrazenie=szukajWyrazenie.replace(/\s/g,'+');
	xmlUrl=serwisUrl+serwisJezyk+'/xhr/s,'+szukajWyrazenie+','+szukajFiltr;
	jQuery.ajax(encodeURI(xmlUrl),{success:function(xmlWynik)
	{
		stronaElementPokaz('szukaj-postep-class','hidden');
		jQuery(xmlWynik).find('szukaj').each(function()
		{
			xmlSzukaj=jQuery(this);
			if(xmlSzukaj.attr('is').length>0)
			{
				stronaElementPokaz('szukaj-sugestia-class','inline');
				document.getElementById('szukaj-sugestia').innerHTML=xmlSzukaj.attr('is');
			}
			if(xmlSzukaj.attr('in').length>0)
			{
				stronaElementPokaz('szukaj-info-class','inline');
				document.getElementById('szukaj-info').innerHTML=xmlSzukaj.attr('in');
			}
			if(xmlSzukaj.attr('wl').length>0 && xmlSzukaj.attr('wp').length>0)
			{
				document.getElementById('szukaj-wyniki-L').innerHTML=xmlSzukaj.attr('wl');
				document.getElementById('szukaj-wyniki-P').innerHTML=xmlSzukaj.attr('wp');
				stronaElementPokaz('szukaj-wyniki-class','inline');
			}
		});
		jQuery(xmlWynik).find('info').each(function()
		{
			xmlSzukaj=jQuery(this);
			if(xmlSzukaj.attr('text').length>0)
			{ 
				stronaElementPokaz('szukaj-info-class','inline');
				document.getElementById('szukaj-info').innerHTML=xmlSzukaj.attr('text');
			}
		});
	},error:function(jqXHR){if(jqXHR.status>0){window.location.replace(serwisUrl+'error/'+jqXHR.status);}}});
}
