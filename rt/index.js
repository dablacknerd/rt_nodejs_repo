var agent = require('superagent');

module.exports = function object(key) {
	return new Movie (key);
}

function Movie (key) {
	this.key = key;
}

Movie.prototype.movies  = function (movieName,flag,done) {
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/movies.json')
	         .type('application/json')
             .query({apikey: this.key})
		     .query({q:movieName})
		     .query({page_limit: '50'})
		     .end (function(err,res) {
			var result1 = jsonParser(res.text);
		  if (result1.total == 0)
			 {
			     var result2 = 'no movies where found for the title you entered';
			     return done(err,result2);
		             
			 } else {
				 if (flag =='a') {
					var result3 = movieTitles(result1)
					return done(err,result3);
				 } else
				  return done(err,result1);
			 }
	 });
	
};


Movie.prototype.movie  = function (movieName, flag,done) {
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/movies.json')
	     .type('application/json')
         .query({apikey: this.key})
		 .query({q:movieName})
		 .query({page_limit: '50'})
		 .end (function(err,res) {
			var result1 = jsonParser(res.text);
			 
			 if (result1.total == 1)
			 {
				if(flag=='a')
				   return done(err,result1.movies[0].id);
				 else
				   return done(err,result1);
			 }
			 else if  (result1.total == 0) {
				 var result2 = 'no movies where found for the title you entered';
				return done(err,result2);
			 }
			 else{
				  var result3 = 'query matched more than one movie, please make query specific';
				 return done(err,result3);
			 }
	 });
	
};


Movie.prototype.boxOffice = function (flag,done) {
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json')
		.type('application/json')
		.query({apikey:this.key})
		.end (function(err,res) {
			var result = jsonParser(res.text);
		    if (flag =='a'){
		try{
			 var n = result.movies.length;
			var titleArray = new Array();
			 var date='';
			 for (var i=0; i<n; i++){
				date = result.movies[i] .release_dates.theater;
				 titleArray[i] = {'title' : result.movies[i].title ,
					              'release date' :date,'id':result.movies[i].id,
					              'mpaa rating': result.movies[i].mpaa_rating,
					              'runtime':result.movies[i].runtime,
					               'thumbnail': result.movies[i].posters.thumbnail,
					               'profile': result.movies[i].posters.profile} ;
			 }
			 var result3 ={"box office":titleArray};
		 }
		 catch(err){}
			   return done(err,result3);
		        }
		        else
		          {
				return done(err,result);
			}
		});
};

Movie.prototype.inTheaters = function(done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json')
		 .type('application/json')
	         .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			var result = jsonParser(res.text); 
			if(result.links.next == null ||result.links.next=='undefined')
			 {
			 var results=paginationInTheaters(result);
			 return done(err,results);
			 } 
			else{
				 return done(err,result);
			}
		 });
}

Movie.prototype.openingMovies=function(done) {
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?')
		 .type('application/json')
	         .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			var result  = jsonParser(res.text); 
			 var n = result.movies.length;
			var titleArray = new Array();
			var date='';
			for(var i=0; i<n; i++){
				 date = result.movies[i].release_dates.theater;
				  titleArray[i] = {'title':result.movies[i].title ,'release date':date,'id':result.movies[i].id};
					   
			   }
			var result3 ={'open movies':titleArray};
			return done(err,result3);
		       
		 });
}

Movie.prototype.upComingMovies = function(done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/upcoming.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			 var result  = jsonParser(res.text); 
         if(result.links.next == null ||result.links.next=='undefined')
			 {
			 var result2= paginationUpcomingMovies(result);
			 return done (err,result2);
			 }
			 else
			 {
				 return done(err,result);
			 }
		 });
}

Movie.prototype.topRentals = function(done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/top_rentals.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			 var result = jsonParser(res.text);
			  var n = result.movies.length;
			 var topArray = new Array();
			 for(var a =0; a<n; a++)
			 topArray[a] = {"title":result.movies[a].title, "id":result.movies[a].id,"thumbnail": result.movies[a].posters.thumbnail} ;
			 var result2 = {'Top DVD Rentals':topArray};
			 return done(err,result2);
		 });
}

Movie.prototype.currentReleasesDvd = function(done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/current_releases.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			 var result  = jsonParser(res.text); 
			  if(result.links.next == null ||result.links.next=='undefined')
			 {
			 var result2= paginationCurrentReleaseDvd(result);
			 return done (err,result2);
			 }
			 else
			 {
				 return done(err,result);
			 }
		 });
}


Movie.prototype.newReleaseDvd = function(done) {
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/new_releases.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			 var result  = jsonParser(res.text); 
			  if(result.links.next == null ||result.links.next=='undefined')
			 {
			 var result2= paginationNewReleaseDvd(result);
			 return done (err,result2);
			 }
			 else
			 {
				 return done(err,result);
			 }
		       
		 });
}

Movie.prototype.upComingDvd = function(done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/upcoming.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			var result  = jsonParser(res.text); 
			 if(result.links.next == null ||result.links.next=='undefined')
			 {
			 var result2= paginationUpComingDvd(result);
			 return done (err,result2);
			 }
			 else
			 {
				 return done(err,result);
			 }
		 });
}

Movie.prototype.movieCast = function(id,done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' +id+'/cast.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			var result  = jsonParser(res.text);
	try{
			var n = result.cast.length;
			var castArray= new Array();
			for(var i=0; i<n; i++)
			{
				castArray[i] ={"id":result.cast[i].id,"name":result.cast[i].name};
			}
			var castObject = {"Cast":castArray};
		}
		catch(err){}
		    return done(err,castObject);
		 });
}

Movie.prototype.similarMovies = function(id,done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' +id+'/similar.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			var result  = jsonParser(res.text);
	try{ 
			var n = result.movies.length;
			var similarArray = new Array();
			for(var i=0; i<n; i++)
			{
				similarArray = {"id":result.movies[i].id, "title":result.movies[i].title};
			}
			var similarObject ={"Similar":similarArray};
		}
		catch (err){}	
			return done(err,similarObject);
	});
}

Movie.prototype.movieClips = function (id,done){
	agent.get('http://api.rottentomatoes.com/api/public/v1.0/movies/' +id+'/clips.json?')
		 .type('application/json')
		 .query({apikey:this.key})
		 .query({page_limit:50})
		 .end(function(err,res){
			 var result = jsonParser(res.text);
			 try{
				 var n = result.clips.length;
				 var clipsArray = new Array();
				 for(var i=0; i<n; i++)
				    {
						clipsArray ={"clip title":result.clips[i].title,
									 "thumb nail":result.clips[i].thumbnail,
									 "clip":result.clips[i].links.alternate
									 };
					}
					var clipObject ={"clips":clipsArray};
			 }
			 catch (err){}
				return done(err,clipObject);
		 });
}




function jsonParser(r) {
	var result;
			 try{
				 result = JSON.parse(r);
			 } catch (err) {}
	return result;			 
}

function movieTitles(result) {
 try{	
	var number = result.total;
	var movieArray = new Array();
	
	for(var i=0; i<number; i++)
	{
		movieArray [i]= {"title":result.movies[i].title,
		                  "id":result.movies[i].id,
		                  "thumbnail": result.movies[i].posters.thumbnail} ;
	}
	
	var movieObject = {"movies_returned":movieArray};
}
catch(err){}
	return movieObject;
}

function paginationUpcomingMovies (result) {
	   try{
	   	     var n = result.movies.length;
			 var movieArray = new Array();
			 var date='';
			 for (var i=0; i<n; i++){
				date = result.movies[i] .release_dates.theater;
				 movieArray[i] = {'title' : result.movies[i].title ,
				                   'id':result.movies[i].id,
					              'release_date' :date,
					               "thumbnail": result.movies[i].posters.thumbnail
					 } ;
			 }
			 
			 var result2= {'upcoming movies':movieArray};
		 }
		 catch(err){}
			 return result2;
}

function paginationCurrentReleaseDvd (result) {
	   try{
	        var n = result.movies.length;
			var currentArray = new Array();
			for(var i=0; i<n; i++){
				  currentArray[i] = {'title':result.movies[i].title ,
					                   'dvd release date':result.movies[i].release_dates.dvd,
					                   'theater release date':result.movies[i].release_dates.theater,
					                   'id':result.movies[i].id
					   };
			   }
			var result3={'size':n,
				'current releases':currentArray};
			}
			catch (err){}
			return result3;
}

function paginationNewReleaseDvd (result) {
	     try{
	        var n = result.movies.length;
			var newArray = new Array();
			for(var i=0; i<n; i++)
			{ 
				  newArray[i] = {'title':result.movies[i].title ,
					             'dvd release date':result.movies[i].release_dates.dvd,
					              'id':result.movies[i].id
					            };
			 }
			var result3 ={'size':n, 'newreleases':newArray};
		}
		catch (err){}
			return result3;
}

function paginationUpComingDvd(result){
	    try{
	        var n = result.movies.length;
			var newArray = new Array();
			for(var i=0; i<n; i++)
			{
				  newArray[i] = {'title':result.movies[i].title ,
					             'dvd release date':result.movies[i].release_dates.dvd,
					               'id':result.movies[i].id};
			 }
			var result3 ={'size':n, 'upcoming Dvds':newArray};
		}
		catch(err){}
			return result3;
	
}

function paginationInTheaters(result){
	try{
	        var n = result.movies.length;
			var newArray = new Array();
			for(var i=0; i<n; i++)
			{
				  newArray[i] = {"title":result.movies[i].title ,
					              "theater release date":result.movies[i].release_dates.theater,
					               "id":result.movies[i].id,
					                "thumbnail": result.movies[i].posters.thumbnail};
			 }
			var result3 ={'size':n, 'newreleases':newArray};
		}
		catch(err){}
			return result3;
	
}
