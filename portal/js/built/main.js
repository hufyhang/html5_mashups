require(["marketView","searchView"],function(e,t){var n=Ribs.make(e.View),r=Ribs.make(t.View);$("#goto-top").on("click",function(){window.scrollTo(0,0)}),Ribs.Router.route({home:function(){r.render(),n.render()}}),Ribs.Router.navigate("home")});