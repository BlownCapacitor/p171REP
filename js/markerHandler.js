var userID = null;
AFRAME.registerComponent("markerhandler", {
    init: async function () {

      if (userID === null) {
        this.getUserID();
      }
      var toys = await this.getToys();
      this.el.addEventListener("markerFound", () => {
        console.log("Marker Found");
        if (userID !== null) {
          var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
        }
      });
      this.el.addEventListener("markerLost", ()=>{
        console.log("market lost");
        this.handleMarkerLost();
      });
    },
    getUserID: function () {
      swal({
        title: "User Id",
        content: {
          element: "input",
          attributes: {
            placeholder: "Format: U01, U02, etc",
            type: "string"
          }
        },
        closeOnClickOutside: false,
      }).then(inputValue => {
        userID = inputValue;
      });
    },
  
    handleMarkerFound: function(toys, markerId){
      var toy = toys.filter(toy => toy.id === markerId)[0];

      if (toy.is_out_of_stock === true) {
        swal({
          icon: "warning",
          title: toy.name.toUpperCase(),
          text: "Out of Stock",
          timer: 2500,
          buttons: false
        });
      } else {
      var buttonSelect = document.getElementById("button-div");
      buttonSelect.style.display = "flex";
      var buttonOrder = document.getElementById("order-button");
      var buttonRate = document.getElementById("summary-button");
  
      buttonOrder.addEventListener("click",()=>{
        swal({
          icon: "./assets/thumbsUp.jpg",
          title: "Order Placed",
          text: "Thank You.\n Your Order has been placed.",
        })
    
    handleOrder()
      })
      buttonRate.addEventListener("click",()=>{
        swal({
          icon: "warning",
          title: "Order Summary",
          text: "In Development. Will Be featured in the next version",
        })
      })

      var toy = toys.filter(toy => toy.id === markerId)[0];

      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);
    }
    },
    handleMarkerLost: function(){
      var buttonSelect = document.getElementById("button-div");
      buttonSelect.style.display = "none";
    },
    handleOrder: function(U01, toy){
     firebase
      .firestore()
      .collection("toys")
      .doc(U01)
      .get()
      .then(doc =>{
        var details = doc.data();
        if(details["current_orders"][toy.id]){
          details["current_orders"][toy.id]["quantity"] += 1;
          var currentQuantity = details["current_orders"][toy.id]["quantity"];
          details["current_orders"][toy.id]["subtotal"] = currentQuantity*toy.price;
        }
        else {
          details["current_orders"][toy.id] = {
            item: toy.name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price
          };
        }
        details.total_bill += toy.price;
        firebase
        .firestore()
        .collection("toys")
        .doc(doc.id)
        .update(details)
      });
     
    },
    getToys: async function () {
      return await firebase
        .firestore()
        .collection("toys")
        .get()
        .then(snap => {
          return snap.docs.map(doc => doc.data());
        });
    }
  
  })