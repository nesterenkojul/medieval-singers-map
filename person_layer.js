function show_tooltip_left(event, d){
    var tooltip_instance = d3.select("#tooltip_left");
    var tooltip_content = tooltip_instance.select(".tooltip_content");
    var visible_text = tooltip_content.text();
    
    d3.selectAll(".marker-active").attr("class" , "marker");

    if(visible_text.includes(d.person_id)){
        tooltip_instance.style("left", "-30%");
        tooltip_content.html("");
        d3.selectAll(".stop-active").attr("class" , "stop");
    }else{
        var tooltip_template = `
        <h3>Личность</h3>
        <a href="javascript:void(0)" onclick="show_tooltip_right()">${d.name}</a>
        <h3>Годы жизни</h3>
        <p>${d.century ? d.century : '-'}</p>
        <h3>Школа</h3>
        <p>${d.school}</p>
        <h3>Место</h3>
        <p>${d.location}</p>
        <h3>Событие</h3>
        <p>${d.event ? d.event : '-'}</p>
        <span id="p_id" style="opacity:0">${d.person_id}</span>`
        tooltip_content.html(tooltip_template);
        tooltip_instance.style("left", "0");
        d3.selectAll(".stop-active").attr("class" , "stop");
        d3.select(this).attr("class" , "stop-active");
    }
};



export function add_choices(data, data_extra) {
    d3.select("#person_choice").selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "p_choice")
        .attr("id", d => "choice_" + d.person_id);
    
    data.forEach( function (per) {
        d3.select("#choice_" + per.person_id)
            .append("button")
            .attr("src", per.img_filename)
            .attr("class", "choice_btn_enabled")
            .attr("id", d => "btn_" + d.person_id);
        d3.select("#btn_" + per.person_id)
            .append("img")
            .attr("src", "./imgs/" + per.img_filename + ".png")
            .attr("class", "choice_img")
            .attr("id", d => "img_" + d.person_id);
        d3.select("#btn_" + per.person_id)
            .append("p")
            .html(per.name)
            .attr("class", "choice_name")
            .attr("id", d => "name_" + d.person_id)
            .style("color", d => d.color);
    })        

    d3.selectAll(".choice_btn_enabled").on("click", update_choice_visibility);
    
    d3.select("#person_choice")
        .append("div")
        .html("<h3><i>Дополнительные личности</i></h3>")
        .style("width", "100%")
        .style("margin-left", "20px");
    d3.select("#person_choice")
        .append("div")
        .attr("id", "person_choice_extra");
    d3.select("#person_choice_extra").selectAll("div")
        .data(data_extra)
        .enter()
        .append("div")
        .attr("class", "p_choice_extra")
        .attr("id", d => "choice_" + d.person_id);

    data_extra.forEach( function (per) {
        d3.select("#choice_" + per.person_id)
            .append("button")
            .attr("src", per.img_filename)
            .attr("class", "extra_choice_btn")
            .attr("id", d => "btn_" + d.person_id);
        d3.select("#btn_" + per.person_id)
            .append("img")
            .attr("src", "./imgs/" + per.img_filename + ".png")
            .attr("class", "choice_img")
            .attr("id", d => "img_" + d.person_id);
        d3.select("#btn_" + per.person_id)
            .append("p")
            .html(per.name)
            .attr("class", "choice_name_extra")
            .attr("id", d => "name_" + d.person_id);
    }) 

    d3.selectAll(".extra_choice_btn").on("click", show_tooltip_right_extra);
    
    function update_school_visibility(){
        d3.select("#tooltip_left").style("left", "-30%");
        //d3.select("#tooltip_right").style("right", "-30%");
        d3.select(".tooltip_content").html("");

        var selected = d3.select(this);
        var selected_school = selected.attr("id");
        var persons = d3.group(data, (d) => d.school).get(selected_school);

        if(selected.attr("class") == "school_btn_enabled") {
            selected.transition().duration(500).style("opacity", 0.5);
            selected.attr("class", "school_btn_disabled");
            persons.forEach(function(per){
                var btn = d3.select("#btn_" + per.person_id);
                if (btn.attr("class") == "choice_btn_enabled")
                    {btn.dispatch('click');}
            })
        }else{
            selected.transition().duration(500).style("opacity", 1);
            selected.attr("class", "school_btn_enabled");
            persons.forEach(function(per){
                var btn = d3.select("#btn_" + per.person_id);
                if (btn.attr("class") == "choice_btn_disabled")
                    {btn.dispatch('click');}
            })
        }
            
    };

    d3.selectAll(".school_btn_enabled").on("click", update_school_visibility);

    function show_tooltip_right_extra(){
        var selected = d3.select(this);
        var selected_id = selected.attr("id").split("_")[1];
        d3.selectAll(".p_choice_extra").each(function(choice){
            if (choice.person_id == selected_id){
                d3.select("#name_" + choice.person_id).style('color', '#ba071c');
            } else {
                d3.select("#name_" + choice.person_id).style('color', '#FFFFFF');
            }
        })
        var tooltip_instance = d3.select("#tooltip_right");
        var tooltip_content = tooltip_instance.select(".tooltip_content");
        var visible_text = tooltip_content.text();
        
        if (visible_text.includes(selected_id)){
            tooltip_instance.style("right", "-30%");
            tooltip_content.html("");
            d3.select("#name_" + selected_id).style('color', '#FFFFFF');
        } else {
            var apd = d3.group(data_extra, (d) => d.person_id).get(selected_id)[0];
            var template = `
                <h2>${apd.name}</h2>
                <p><i>На карте не отображен</i><span id="p_id" style="opacity:0">${apd.person_id}</span></p>
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
                <p>${apd.description ? apd.description : '-'}</p>
                <h3>Источник</h3>
                <p>${apd.sources ? apd.sources : '-'}</p>`
            tooltip_content.html(template);
            tooltip_instance.style("right", "0");
        }
    };
};



export function add_stops_layer(svg, projection, data) {
    svg.selectAll("stops")
        .data(data)
        .enter()
        .append("circle")
        /*.attr("d", function(d){
          if(d.category == 'Х'){return icon.church;}
          return icon.city;
        })*/
        .attr("class" , "stop")
        .attr("id" , d => "stop_" + d.person_id)
        .attr("cx", d => projection([d.long, d.lat])[0])
        .attr("cy", d => projection([d.long, d.lat])[1])
        .attr("r", d => 3)
        .attr("fill", d => d.color)
        .attr("stroke", d => d.color)
        /*.attr("transform", function(d) {
            return "translate(" + projection([d.long, d.lat]) + ") scale(" + 0.4 + ")";
        })*/
        .on("click", show_tooltip_left);
};



export function add_connection_layer(svg, geopath, data) {
    var person_locations_grouped = d3.group(data, (d) => d.person_id);
    var person_lines = [];
    var unique_persons = [... new Set(data.map(k => k["person_id"]))];

    unique_persons.forEach( function (per) {
      var locations = person_locations_grouped.get(per);
      for (var i = 1; i < locations.length; i++) {
        person_lines.push({"type": "Feature", "properties": {"person_id": per, "order": locations[i].order, "color": locations[i].color}, 
        "geography": {type: "LineString", 
                coordinates: [[locations[i-1].long, locations[i-1].lat], 
                [locations[i].long, locations[i].lat]]}
        });
      };
    });

    svg.selectAll("connection")
        .data(person_lines)
        .enter()
        .append("path")
        .attr("class" , "connection")
        .attr("id" , d => "conn_" + d.properties.person_id)
        .attr("d", d => geopath(d.geography))
        .attr("fill", "none")
        .attr("stroke", d => d.properties.color)
        .style("stroke-width", .6);
};



function update_choice_visibility(){
    var selected = d3.select(this);
    var before = selected.attr("class");
    var selected_id = selected.attr("id").split("_")[1];

    var tooltip_instance1 = d3.select("#tooltip_left");
    var tooltip_content1 = tooltip_instance1.select(".tooltip_content");
    var visible_text1 = tooltip_content1.text();
    var tooltip_instance2 = d3.select("#tooltip_right");
    var tooltip_content2 = tooltip_instance2.select(".tooltip_content");
    var visible_text2 = tooltip_content2.text();

    if (visible_text1.includes(selected_id) | visible_text2.includes(selected_id) | selected_id == "all"){
        tooltip_instance1.style("left", "-30%");
        tooltip_content1.html("");
        tooltip_instance2.style("right", "-30%");
        tooltip_content2.html("");
    }

    if (selected_id == "all"){
        if (before == "choice_btn_enabled"){
            d3.selectAll(".school_btn_enabled").transition().duration(500).style("opacity", 0.5);
            d3.selectAll(".school_btn_enabled").attr("class", "school_btn_disabled");
            selected.attr("class", "choice_btn_disabled")
            selected.transition().duration(1000).style("opacity", 0.5);
            d3.selectAll(".choice_btn_enabled").dispatch('click');
        }else{
            d3.selectAll(".school_btn_disabled").transition().duration(500).style("opacity", 1);
            d3.selectAll(".school_btn_disabled").attr("class", "school_btn_enabled");
            selected.attr("class", "choice_btn_enabled")
            selected.transition().duration(1000).style("opacity", 1);
            d3.selectAll(".choice_btn_disabled").dispatch('click');
        }
        
    }else{
        if (before == "choice_btn_enabled"){
            d3.select("#btn_all").attr("class", "choice_btn_disabled")
            d3.select("#btn_all").transition().duration(1000).style("opacity", 0.5);
            selected.attr("class", "choice_btn_disabled")
            selected.transition().duration(1000).style("opacity", 0.5);
            d3.selectAll("#conn_" + selected_id).transition().duration(500).style("opacity", 0);
            d3.selectAll("#stop_" + selected_id).transition().duration(500).style("opacity", 0);
            d3.selectAll("#stop_" + selected_id).attr("class" , "stop-invisible").on("click", function(){});
        }else{
            selected.attr("class", "choice_btn_enabled")
            selected.transition().duration(1000).style("opacity", 1);
            d3.selectAll("#conn_" + selected_id).transition().duration(500).style("opacity", 1);
            d3.selectAll("#stop_" + selected_id).transition().duration(500).style("opacity", 1);
            d3.selectAll("#stop_" + selected_id).attr("class" , "stop").on("click", show_tooltip_left);
        };
    };
};




