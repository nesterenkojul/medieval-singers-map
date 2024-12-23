import * as church from "./church_layer.js";
import * as person from "./person_layer.js";


function join(trans_d, per_d){
    var all_person = d3.group(per_d, (d) => d.person_id);
    trans_d.forEach(function(td){
        var this_person = all_person.get(td.person_id)[0];
        var fields = ["name", "school", "color", "century"];
        fields.forEach(function(key){
            td[key] = this_person[key];
        })
    })
    return trans_d 
}

var header_h = document.getElementsByTagName('h1')[0].offsetHeight,
    height = window.innerHeight - header_h,
    width = height / 2;
  
function adjustSize() {
    var header_h = document.getElementsByTagName('h1')[0].offsetHeight;
    height = window.innerHeight - header_h,
    width = height / 2;
    document.getElementsByClassName('bg')[0].setAttribute("viewBox", `0 0 ${width} ${height}`);
    var col_offset = document.getElementById('church_choice').offsetHeight +
                    document.getElementById('school_choice').offsetHeight +
                    3*document.getElementsByClassName('filter_title')[0].offsetHeight + 120;
    document.getElementById('person_choice').style.height = height - col_offset +'px';
    document.getElementsByClassName('tooltip')[0].style.height = height - 35 +'px';
    document.getElementsByClassName('tooltip')[1].style.height = height - 35 +'px';
    document.getElementsByClassName('tooltip_content')[0].style.height = height - 60 +'px';
    document.getElementsByClassName('tooltip_content')[1].style.height = height - 60 +'px';
};
window.onresize = adjustSize;
window.onload = adjustSize;

var projection = d3.geoMercator()
        .center([81, 56])                
        .scale(500)                   
        //.translate([ width/2, height/2 ]);
    
var geopath = d3.geoPath()
        .projection(projection);

var svg = d3.select("#singers_map")
        .append("svg")
	      // .attr("width", width)
	      // .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        //.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("class", "bg");

function close_left_tooltip(){
        var tooltip_instance = d3.select("#tooltip_left");
        var tooltip_content = tooltip_instance.select(".tooltip_content");
        tooltip_instance.style("left", "-30%");
        tooltip_content.html("");
        d3.selectAll(".marker-active").attr("class" , "marker");
        d3.selectAll(".stop-active").attr("class" , "stop");
    };
window.close_left_tooltip = close_left_tooltip

function close_right_tooltip(){
    var tooltip_instance = d3.select("#tooltip_right");
    var tooltip_content = tooltip_instance.select(".tooltip_content");
    tooltip_instance.style("right", "-30%");
    tooltip_content.html("");
    d3.selectAll(".choice_name_extra").style("color", "#FFFFFF");
};
window.close_right_tooltip = close_right_tooltip


Promise.all([
      d3.json("./data/russia.geojson"),
      d3.dsv(';', "./data/locations.csv"),
      d3.dsv(';', "./data/person_steps.csv"),
      d3.dsv(';', "./data/persons.csv"),
      d3.dsv(';', "./data/persons_extra.csv"),
      d3.dsv(';', "./data/lukoshko_manuscripts.csv")
]).then(render_map)


function render_map([geojson_data, 
                    location_data, 
                    step_data, 
                    person_data, 
                    person_extra_data, 
                    lukoshko_data]){

    function show_tooltip_right(){
        var tooltip_instance = d3.select("#tooltip_right");
        var tooltip_content = tooltip_instance.select(".tooltip_content");
        var active_person_id = d3.select("#p_id").text();
        var apd = d3.group(person_data, (d) => d.person_id).get(active_person_id)[0];
        var tooltip_template = `
            <h2>${apd.name}</h2>
            <p><span id="p_id" style="opacity:0">${apd.person_id}</span></p>
            <h3>Школа</h3>
            <p>${apd.school ? apd.school : '-'}</p>
            <h3>Варианты имен</h3>
            <p>${apd.name_variants ? apd.name_variants : '-'}</p>
            <h3>Годы жизни</h3>
            <p>${apd.century ? apd.century : '-'}</p>
            <h3>Основной род деятельности</h3>
            <p>${apd.profession_1 ? apd.profession_1 : '-'}</p>
            <h3>Иные указания рода деятельности</h3>
            <p>${apd.profession_2 ? apd.profession_2 : '-'}</p>
            <h3>Краткая справка</h3>
            <p>${apd.description ? apd.description : '-'}</p>`
        if (active_person_id == 'p9'){
            tooltip_template += `
            <h3><a href="javascript:void(0)" id="manuscripts_header">Сочинения <span id="manuscripts_toggle">+</span></a></h3>
            <div id="manuscripts"></div>
            <h3>Источник</h3>
            <p>${apd.sources ? apd.sources : '-'}</p>
            <h3><a href="javascript:void(0)" id="sources_header">Дополнительные источники <span id="sources_toggle">+</span></a></h3>
            <div id="sources"></div>`
            tooltip_content.html(tooltip_template);
            tooltip_instance.style("right", "0");
            d3.select("#manuscripts_header").on("click", function(){
                var selected = d3.select(this);
                var selected_id = selected.attr("id").split('_')[0];
                var block = d3.select('#' + selected_id);
                var toggle = d3.select('#' + selected_id + "_toggle");
                if (block.html()) {
                    block.html("")
                    toggle.html("+")
                } else {
                    block.html(`
                        <table style="font-size: xx-small;">
                        <thead>
                            <tr>
                              <th>№</th>
                              <th>Жанр</th>
                              <th>Инципит</th>
                              <th>Указание</th>
                              <th>Примечания</th>
                              <th>Источники</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    <a target="_blank" href="https://docs.google.com/spreadsheets/d/1pGyE4WMK_VTcAE5dUqxGtpX6l00OPNRfh5mOt0n2iqo/edit?usp=sharing"><i>Ссылка на таблицу</i></a>
                    `)
                    block.select("tbody").selectAll("tr")
                    .data(lukoshko_data)
                    .enter()
                    .append("tr")
                    .html(d => `<td>${d.num}</td>
                          <td>${d.genre}</td>
                          <td>${d.title}</td>
                          <td>${d.reference}</td>
                          <td>${d.notes ? d.notes : '-'}</td>
                          <td>${d.literature ? d.literature : '-'}</td>`)

                    toggle.html("-")
                }
            });
            
            d3.select("#sources_header").on("click", function(){
                var selected = d3.select(this);
                var selected_id = selected.attr("id").split('_')[0];
                var block = d3.select('#' + selected_id);
                var toggle = d3.select('#' + selected_id + "_toggle");
                if (block.html()) {
                    block.html("")
                    toggle.html("+")
                } else {
                    block.html(`<p>${apd.sources_2}</p>`)
                    toggle.html("-")
                }
            });
        } else {
            tooltip_template += `
            <h3>Источник</h3>
            <p>${apd.sources ? apd.sources : '-'}</p>`
            tooltip_content.html(tooltip_template);
            tooltip_instance.style("right", "0");
        }
        
    };
    window.show_tooltip_right = show_tooltip_right;

    person.add_choices(person_data, person_extra_data);
        
    svg.selectAll("path")
        .data(geojson_data.features)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", geopath);
    church.add_layer(svg, projection, location_data)
    person.add_connection_layer(svg, geopath, join(step_data, person_data))
    person.add_stops_layer(svg, projection, join(step_data, person_data))
    

    function zoomed(event) {
      svg.selectAll('.land')
          .attr('transform', event.transform); 
      svg.selectAll('.connection')
          .style("stroke-width", 0.6 / event.transform.k)
          .attr('transform', event.transform); 
      var transform_marker = function(d) {
            var new_translate = event.transform.translate(projection([d.long, d.lat])[0], projection([d.long, d.lat])[1]);
            return  new_translate + " scale(" + 1 / event.transform.k * 0.55 + ")";
        };
      svg.selectAll('.marker')
        .attr("transform", transform_marker);
      svg.selectAll('.marker-active')
        .attr("transform", transform_marker);
      svg.selectAll('.marker-invisible')
        .attr("transform", transform_marker);
      svg.selectAll('.stop')
        .attr("cx", d => event.transform.applyX(projection([d.long, d.lat])[0]))
        .attr("cy", d => event.transform.applyY(projection([d.long, d.lat])[1]))
        //.attr("r", d => 2 / event.transform.k)
      svg.selectAll('.stop-active')
        .attr("cx", d => event.transform.applyX(projection([d.long, d.lat])[0]))
        .attr("cy", d => event.transform.applyY(projection([d.long, d.lat])[1]))
        //.attr("r", d => 2 / event.transform.k)
      svg.selectAll('.stop-invisible')
        .attr("cx", d => event.transform.applyX(projection([d.long, d.lat])[0]))
        .attr("cy", d => event.transform.applyY(projection([d.long, d.lat])[1]))
        //.attr("r", d => 2 / event.transform.k)
    };

    var zoom = d3.zoom()
            .scaleExtent([1, 11])
            .translateExtent([
                [-width/10, -height/10],
                [width*1.2, height*1.1],
            ])
            .on('zoom', zoomed);

    svg.call(zoom);

}
