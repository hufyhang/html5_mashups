define("market",[],function(){var e="http://feifeihang.info/hypermash/portal/php/loadProjectMarket.php",t=Ribs.Model.make({fetch:{url:e,method:"GET"}});return{Market:t}}),define("marketView",["market"],function(e){var t=Ribs.make(e.Market),n=Ribs.View.make({el:$(".panels"),template:$("#panel-template").html(),render:function(){t.fetch({done:function(e){n.renderData(e)}})}});return n.renderData=function(e){var t=JSON.parse(e);console.log(t);for(var r in t.projects)if(t.projects.hasOwnProperty(r)){var i=t.projects[r];i.description=i.description.replace(/\$quot;/g,'"')}n.el.html(_.template(n.template,{data:t.projects}))},{View:n}}),define("search",[],function(){var e=Ribs.Model.make({fetch:{url:"http://feifeihang.info/hypermash/portal/php/search.php",method:"POST"}});return{Search:e}}),define("searchView",["search","marketView"],function(e,t){var n=Ribs.make(e.Search),r=Ribs.make(t.View),i="";i+='<div><input type="text" class="form-control" id="search-input" ',i+='placeholder="keywords..."/><div class="btn btn-default" id="search-btn">Search</div></div>';var s=function(){var e=$("#search-input").val();n.fetch({data:{keywords:e},done:function(e){r.renderData(e)}})},o=Ribs.View.make({el:$(".search-panel"),template:$("#panel-template"),render:function(){o.el.html(i),$("#search-btn").on("click",function(){s()}),$("#search-input").keypress(function(e){e.which===13&&s()})}});return{View:o}}),require(["marketView","searchView"],function(e,t){var n=Ribs.make(e.View),r=Ribs.make(t.View);$("#goto-top").on("click",function(){window.scrollTo(0,0)}),Ribs.Router.route({home:function(){r.render(),n.render()}}),Ribs.Router.navigate("home")}),define("main",function(){});