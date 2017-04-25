

  Promise
    .resolve(3)
    .then(function(val){
      console.log(val);
      //return val * 3;

      return Promise
        .resolve(19)
        .then(function(v){
          return v * 8;
        })


    })
    .then(function(v){
      console.log(v);
    })


Promise
  .all([Promise.resolve(45), 
        Promise.resolve(89)])
  .then(function(results){
    console.log(results);
  })
