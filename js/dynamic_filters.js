(function(){
    'use strict';

    var YEAR_CFG = {
        2018: {flow:'layer_FluxodeInscritosN_8', flowPane:'pane_FluxodeInscritosN_8', assoc:'layer_SededaAssociada_9', origin:'layer_UFdeOrigem_10', heat:'layer_2018_13'},
        2021: {flow:'layer_FluxodeInscritosN_5', flowPane:'pane_FluxodeInscritosN_5', assoc:'layer_SededaAssociada_6', origin:'layer_UFdeOrigem_7', heat:'layer_2021_12'},
        2025: {flow:'layer_FluxodeInscritosN_2', flowPane:'pane_FluxodeInscritosN_2', assoc:'layer_SededaAssociada_3', origin:'layer_UFdeOrigem_4', heat:'layer_2025_11'}
    };

    var selectedAreas = [];
    var selectedUFs = [];
    var NE_UFS = ['AL','BA','CE','MA','PB','PE','PI','RN','SE'];

    function esc(v){
        return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function hasAnyFilter(){ return selectedAreas.length > 0 || selectedUFs.length > 0; }
    function recordsForYear(year){
        return FILTER_RECORDS.filter(function(r){
            var areaOK = selectedAreas.length === 0 || selectedAreas.indexOf(r.area) !== -1;
            var ufOK = selectedUFs.length === 0 || selectedUFs.indexOf(r.ufi) !== -1;
            return r.y === year && areaOK && ufOK;
        });
    }
    function flowVisual(n){
        n = Number(n || 0);
        if (n <= 30) return {color:'#f28e2b', weight:1.4};
        if (n <= 60) return {color:'#d95f0e', weight:2.4};
        if (n <= 100) return {color:'#e31a1c', weight:3.4};
        return {color:'#5b0a0a', weight:4.8};
    }
    function curvePts(start,end,bendFactor){
        var x1=start[1], y1=start[0], x2=end[1], y2=end[0];
        var mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1;
        var len=Math.sqrt(dx*dx+dy*dy)||1, off=len*bendFactor;
        var cx=mx-(dy/len)*off, cy=my+(dx/len)*off;
        var pts=[], steps=30;
        for(var i=0;i<=steps;i++){
            var t=i/steps,u=1-t;
            pts.push([u*u*y1+2*u*t*cy+t*t*y2, u*u*x1+2*u*t*cx+t*t*x2]);
        }
        return pts;
    }
    function bearing(a,b){
        var lat1=a[0]*Math.PI/180, lat2=b[0]*Math.PI/180, dLon=(b[1]-a[1])*Math.PI/180;
        var y=Math.sin(dLon)*Math.cos(lat2);
        var x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        return (Math.atan2(y,x)*180/Math.PI+360)%360;
    }
    function bindFlowPopup(line,year,uf,assoc,count){
        line.bindPopup('<table>'+ 
            '<tr><th scope="row">Ano</th><td>'+year+'</td></tr>'+ 
            '<tr><th scope="row">UF de origem</th><td>'+esc(uf)+'</td></tr>'+ 
            '<tr><th scope="row">Associada</th><td>'+esc(assoc)+'</td></tr>'+ 
            '<tr><th scope="row">Nº de inscritos</th><td>'+count+'</td></tr>'+ 
            '</table>',{maxHeight:400});
    }
    function rebuildFlowLayer(year,layerGroup,paneName,recs){
        if(!layerGroup || !layerGroup.clearLayers) return;
        layerGroup.clearLayers();
        var groups={};
        recs.forEach(function(r){
            var key=r.uf+'||'+r.assoc;
            if(!groups[key]) groups[key]={uf:r.uf,assoc:r.assoc,lat:r.alat,lon:r.alon,n:0};
            groups[key].n++;
        });
        Object.keys(groups).forEach(function(key){
            var g=groups[key], origin=UF_ORIGIN_COORDS[g.uf];
            if(!origin) return;
            var end=[g.lat,g.lon], pts=curvePts(origin,end,-0.18), v=flowVisual(g.n);
            var ln=L.polyline(pts,{pane:paneName,color:v.color,weight:v.weight,opacity:.9,lineCap:'round',lineJoin:'round',interactive:true});
            bindFlowPopup(ln,year,g.uf,g.assoc,g.n); ln.addTo(layerGroup);
            var pa=pts[pts.length-2],pb=pts[pts.length-1],ang=bearing(pa,pb)-90;
            var ic=L.divIcon({className:'flow-arrow-icon',html:'<div class="flow-arrow-triangle" style="color:'+v.color+';transform:rotate('+ang+'deg)"></div>',iconSize:[14,14],iconAnchor:[7,5]});
            L.marker(end,{pane:paneName,icon:ic,interactive:false}).addTo(layerGroup);
        });
    }
    function updateDynamicHeat(dynamicHeat,recs){
        if(!dynamicHeat || !dynamicHeat.setLatLngs) return;
        var counts={};
        recs.forEach(function(r){
            var key=r.assoc+'||'+r.alat+'||'+r.alon;
            if(!counts[key]) counts[key]={lat:r.alat,lon:r.alon,n:0};
            counts[key].n++;
        });
        var arr=Object.keys(counts).map(function(k){return counts[k];});
        var maxN=arr.reduce(function(m,d){return Math.max(m,d.n);},0)||1;
        dynamicHeat.setLatLngs(arr.map(function(d){return [d.lat,d.lon,d.n/maxN];}));
        if(dynamicHeat.redraw) dynamicHeat.redraw();
    }
    function updatePointPopups(year,assocLayer,originLayer,recs){
        var byAssoc={},byUF={};
        recs.forEach(function(r){byAssoc[r.assoc]=(byAssoc[r.assoc]||0)+1;byUF[r.uf]=(byUF[r.uf]||0)+1;});
        if(assocLayer && assocLayer.eachLayer) assocLayer.eachLayer(function(layer){
            if(!layer.feature||!layer.feature.properties)return; var p=layer.feature.properties,name=p.ASSOCIADA;if(!name)return;
            layer.bindPopup('<table><tr><th scope="row">Ano</th><td>'+year+'</td></tr><tr><th scope="row">Associada</th><td>'+esc(name)+'</td></tr><tr><th scope="row">Latitude da associada</th><td>'+esc(p.LAT_ASS)+'</td></tr><tr><th scope="row">Longitude da associada</th><td>'+esc(p.LONG_ASS)+'</td></tr><tr><th scope="row">Nº de inscritos</th><td>'+(byAssoc[name]||0)+'</td></tr></table>',{maxHeight:400});
        });
        if(originLayer && originLayer.eachLayer) originLayer.eachLayer(function(layer){
            if(!layer.feature||!layer.feature.properties)return;var p=layer.feature.properties,uf=p.SIGLA_UF;if(!uf)return;
            layer.bindPopup('<table><tr><th scope="row">Ano</th><td>'+year+'</td></tr><tr><th scope="row">UF de origem</th><td>'+esc(uf)+'</td></tr><tr><th scope="row">Nº de inscritos</th><td>'+(byUF[uf]||0)+'</td></tr></table>',{maxHeight:400});
        });
    }

    window.createDynamicHeatLayer=function(paneName){
        return L.heatLayer([],{pane:paneName,radius:48,blur:34,minOpacity:.16,max:1,gradient:{0:'#313695',.18:'#4575b4',.35:'#74add1',.48:'#abd9e9',.58:'#ffffbf',.72:'#fdae61',.86:'#d73027',1:'#a50026'}});
    };

    window.refreshDynamicLayers=function(){
        var total=0, filtered=hasAnyFilter();
        [2018,2021,2025].forEach(function(year){
            var recs=recordsForYear(year); total+=recs.length; var c=YEAR_CFG[year];
            rebuildFlowLayer(year,window[c.flow],c.flowPane,recs);
            updatePointPopups(year,window[c.assoc],window[c.origin],recs);
            var group=window[c.heat], stat=window['staticHeat_'+year], dyn=window['dynamicHeat_'+year];
            if(group && group.clearLayers){
                group.clearLayers();
                if(filtered){ updateDynamicHeat(dyn,recs); group.addLayer(dyn); }
                else if(stat){ group.addLayer(stat); }
            }
        });
        var el=document.getElementById('filter-result-count');
        if(el) el.textContent=total.toLocaleString('pt-BR')+' inscrições nos anos exibidos';
        var note=document.getElementById('heat-mode-note');
        if(note) note.textContent=filtered?'Concentração recalculada para os filtros selecionados':'Raster original do mapa de calor';
    };

    function checkedValues(box){
        return Array.prototype.slice.call(box.querySelectorAll('input[type=checkbox]:checked')).map(function(i){return i.value;});
    }
    function buildChecks(container,values,prefix){
        values.forEach(function(v){
            var id=prefix+'_'+Math.random().toString(36).slice(2,8);
            var lab=document.createElement('label');lab.className='multi-check-item';
            lab.innerHTML='<input type="checkbox" value="'+esc(v)+'"> <span>'+esc(v)+'</span>';
            container.appendChild(lab);
        });
    }
    function syncAndRefresh(){
        selectedAreas=checkedValues(document.getElementById('area-checks'));
        selectedUFs=checkedValues(document.getElementById('uf-checks'));
        document.getElementById('area-summary').textContent=selectedAreas.length?selectedAreas.length+' selecionada(s)':'Todas as áreas';
        document.getElementById('uf-summary').textContent=selectedUFs.length?selectedUFs.length+' selecionada(s)':'Todas as UFs';
        window.refreshDynamicLayers();
    }
    function setChecks(container,values){
        var wanted={};values.forEach(function(v){wanted[v]=true;});
        container.querySelectorAll('input[type=checkbox]').forEach(function(i){i.checked=!!wanted[i.value];});
        syncAndRefresh();
    }

    window.addFilterPanel=function(){
        var panel=document.createElement('div');panel.id='analysis-filter-panel';panel.className='analysis-filter-panel';
        panel.innerHTML=
            '<div class="analysis-filter-title">Filtros</div>'+ 
            '<div class="multi-section"><button class="multi-toggle" type="button">Área do conhecimento <span id="area-summary">Todas as áreas</span></button><div class="multi-menu" id="area-menu"><div class="multi-actions"><button data-act="area-all">Todas</button><button data-act="area-clear">Limpar</button></div><div class="multi-checks" id="area-checks"></div></div></div>'+ 
            '<div class="multi-section"><button class="multi-toggle" type="button">UF da graduação <span id="uf-summary">Todas as UFs</span></button><div class="multi-menu" id="uf-menu"><div class="multi-actions"><button data-act="uf-all">Todas</button><button data-act="uf-ne">Nordeste</button><button data-act="uf-clear">Limpar</button></div><div class="multi-checks" id="uf-checks"></div></div></div>'+ 
            '<div class="filter-actions"><button id="filter-reset" type="button">Limpar todos os filtros</button></div>'+ 
            '<div id="filter-result-count" class="filter-result-count"></div>'+ 
            '<div id="heat-mode-note" class="filter-note">Raster original do mapa de calor</div>';
        document.body.appendChild(panel);
        buildChecks(document.getElementById('area-checks'),FILTER_AREAS,'a');
        buildChecks(document.getElementById('uf-checks'),FILTER_UFS_INST,'u');
        panel.querySelectorAll('.multi-toggle').forEach(function(btn){btn.addEventListener('click',function(){this.nextElementSibling.classList.toggle('open');});});
        panel.addEventListener('change',function(e){if(e.target.matches('input[type=checkbox]'))syncAndRefresh();});
        panel.addEventListener('click',function(e){
            var a=e.target.getAttribute('data-act'); if(!a)return; e.preventDefault();
            if(a==='area-all')setChecks(document.getElementById('area-checks'),FILTER_AREAS);
            if(a==='area-clear')setChecks(document.getElementById('area-checks'),[]);
            if(a==='uf-all')setChecks(document.getElementById('uf-checks'),FILTER_UFS_INST);
            if(a==='uf-ne')setChecks(document.getElementById('uf-checks'),NE_UFS);
            if(a==='uf-clear')setChecks(document.getElementById('uf-checks'),[]);
        });
        document.getElementById('filter-reset').addEventListener('click',function(){setChecks(document.getElementById('area-checks'),[]);setChecks(document.getElementById('uf-checks'),[]);});
        L.DomEvent.disableClickPropagation(panel);L.DomEvent.disableScrollPropagation(panel);
    };
})();
