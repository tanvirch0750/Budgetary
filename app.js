// todo -> Budget Controller (Data modules)
var budgetController = (function () {
  // constructors
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // expense prototype for calculate percentage
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function () {
    return this.percentage;
  };


  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Calculate total income and expense
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  // data structure
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: [],
      inc: []
    },
    budget: 0,
    percentage: -1
  };

  // add item
  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on 'inc' or exp
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // push into our data structure
      data.allItems[type].push(newItem);

      // return our new element
      return newItem;
    },

    // Delete Item
    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // Calculate Budget method
    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");

      // calculate the budget income - expenses;
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    // get budget method
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    // calculate percentage method
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    // get percentage
    getPercentage: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentages();
      });
      return allPerc;
    },

    testing: function () {
      console.log(data);
    }
  };
})();

/////////////////////////////////////
// todo -> UI Controller (UI modules)
var UIController = (function () {
  // DOM string / html css class object
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function (num, type) {
    /*
      + or - before number
      exatcly 2 decimal points
      comma separating the thousands
    */

    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); //input 23510, output 23,510
    }
    dec = numSplit[1];
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // get value or data or read from input fields
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    // add list item or newItem to the user interface (UI)
    addListItem: function (obj, type) {
      var html, newHtml, element;

      // create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          ' <div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // dele list item from ui
    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    // clear fields
    clearFields: function () {
      var fields, fieldsArray;
      var fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      var fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function (current) {
        current.value = "";
      });

      fieldsArray[0].focus();
    },

    // Display Budget function
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "___";
      }
    },

    // Display percentages
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "___";
        }
      });
    },

    // Display date
    displayMonth: function () {
      var now, months, month, year;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    // Changed type, changed input border color
    changedType: function () {

      var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    // get class from css method call
    getDOMstrings: function () {
      return DOMstrings;
    }
  };
  ////////////////////////
})();

/////////////////////////////////////
// todo -> CONTROLLER (CONTROLLER MODULES)
var controller = (function (budgetCtrl, UIctrl) {
  var setupEventListener = function () {
    var DOM = UIctrl.getDOMstrings();
    // for mouse click
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    // for keyboard enter press
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
  };

  // Update budget function
  var updateBudget = function () {
    // 5. Calculate Budget
    budgetCtrl.calculateBudget();
    // 6. return the budget
    var budget = budgetCtrl.getBudget();
    // 7. Display the budget in UI
    UIctrl.displayBudget(budget);
  };

  // update percentages
  var updatePercentages = function () {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. read percentage from the budget controller
    var percentages = budgetCtrl.getPercentage();
    // 3. update the UI with the new percentage
    UIctrl.displayPercentages(percentages);
  };

  // Add item function
  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the field input data.
    var input = UIctrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3. Add the item to the UI
      UIctrl.addListItem(newItem, input.type);

      // 4. clear the items or input fields
      UIctrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update the percentages
      updatePercentages();
    }
  };

  // Event delegation delete item
  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      // inc-1 or exp-1
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1. Delete item from user interface
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UIctrl.deleteListItem(itemId);

      // 3. Update the total budget, income and expenses
      updateBudget();

      // 4. Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UIctrl.displayMonth();
      UIctrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListener();
    }
  };
})(budgetController, UIController);

controller.init();