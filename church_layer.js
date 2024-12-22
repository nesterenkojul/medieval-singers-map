import * as icon from "/icons.js";


export function add_layer(svg, projection, data) {
    
    function show_tooltip(event, d){
        var tooltip_instance = d3.select("#tooltip_left");
        var tooltip_content = tooltip_instance.select(".tooltip_content");
        var visible_text = tooltip_content.text();

        d3.selectAll(".stop-active").attr("class" , "stop");
  
        if(visible_text.includes(d.location_name) & !visible_text.includes("Личность")){
          tooltip_instance.style("left", "-30%");
          tooltip_content.html("");
          d3.selectAll(".marker-active").attr("class" , "marker");
        }else{
          var tooltip_template = `<h2>${d.location_name}</h2>
          <p><span style="opacity:0">${d.person_id}</span></p>`
          if (['media', 'both'].includes(d.category)) {
            tooltip_template += `<br><a href="${d.media_link}" target="_blank">
            Видеозапись звучания древнерусских песнопений в рамках проекта «Древние сакральные пространства Северо-Запада России: звуковая карта»
            </a>`
          }
          tooltip_content.html(tooltip_template);
          tooltip_instance.style("left", "0");
          d3.selectAll(".marker-active").attr("class" , "marker");
          d3.select(this).attr("class" , "marker-active");
        }
      };

    svg.selectAll("marks")
        .data(data)
        .enter()
        .append("path")
        .attr("d", icon.church) /* function(d){
          if(d.category == 'Х'){return icon.church;}
          return icon.city;
        }) */
        .attr("class" , "marker")
        .attr("id" , d => d.category)
        .attr("transform", function(d) {
            return "translate(" + projection([d.long, d.lat]) + ") scale(" + 0.55 + ")";
        })
        .on("click", show_tooltip);
      
    function update_category_visibility(){

        d3.select("#tooltip_left").style("left", "-30%");
        d3.select(".tooltip_content").html("");

        d3.selectAll(".church_btn_enabled").attr("class" , "church_btn_disabled");
        d3.select(this).attr("class" , "church_btn_enabled");
        d3.selectAll(".church_btn_disabled").transition().duration(500).style("opacity", 0.5);
        d3.selectAll(".church_btn_enabled").transition().duration(500).style("opacity", 1);

        var selected = d3.select(this);
        var selected_id = selected.attr("id").split("_")[2];

        if (selected_id == "all") {
          svg.selectAll(".marker-invisible").transition().duration(1000).style("opacity", 1);
          svg.selectAll(".marker-invisible").attr("class" , "marker").on("click", show_tooltip);
          return;
        } 
        if (selected_id == "none") {
          svg.selectAll(".marker").transition().duration(1000).style("opacity", 0);
          svg.selectAll(".marker").attr("class" , "marker-invisible").on("click", function(){});
          return;
        }
        
        var another_group = svg.selectAll( "#" + ['linked', 'media'].filter(d => d != selected_id)[0]);
        var this_group = svg.selectAll( "#" + selected_id);
        var empties = svg.selectAll( "#empty");
        var boths = svg.selectAll( "#both");

        another_group.transition().duration(1000).style("opacity", 0);
        another_group.attr("class" , "marker-invisible").on("click", function(){});
        empties.transition().duration(1000).style("opacity", 0);
        empties.attr("class" , "marker-invisible").on("click", function(){});
        this_group.transition().duration(1000).style("opacity", 1);
        this_group.attr("class" , "marker").on("click", show_tooltip);
        boths.transition().duration(1000).style("opacity", 1);
        boths.attr("class" , "marker").on("click", show_tooltip);
    };

    d3.selectAll(".church_btn_enabled").on("click", update_category_visibility);
    d3.selectAll(".church_btn_disabled").on("click", update_category_visibility);
}