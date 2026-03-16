/* Meal & Cholesterol Tracker
   Stores data in localStorage keyed by date (YYYY-MM-DD).
   Data shape: { [date]: MealEntry[] }
   MealEntry: { id, time, name, portion, cholesterol, calories, satFat, notes }
*/

var MealTracker = (function () {
  var STORAGE_KEY = 'meal_tracker_v1';
  var DAILY_LIMIT = 300; // mg cholesterol
  var currentDate = todayStr();

  // --- Common foods reference (per 100g unless noted) ---
  var FOOD_DB = [
    { name: 'Huevo entero', cholesterol: 373, calories: 155, satFat: 3.1, unit: '1 unidad (50g)', defaultPortion: 50 },
    { name: 'Yema de huevo', cholesterol: 1085, calories: 322, satFat: 9.6, unit: '100g', defaultPortion: 17 },
    { name: 'Leche entera', cholesterol: 14, calories: 61, satFat: 2.0, unit: '100ml', defaultPortion: 200 },
    { name: 'Leche descremada', cholesterol: 2, calories: 35, satFat: 0.1, unit: '100ml', defaultPortion: 200 },
    { name: 'Queso cheddar', cholesterol: 105, calories: 402, satFat: 21, unit: '100g', defaultPortion: 30 },
    { name: 'Queso cottage', cholesterol: 17, calories: 98, satFat: 1.7, unit: '100g', defaultPortion: 100 },
    { name: 'Mantequilla', cholesterol: 215, calories: 717, satFat: 51, unit: '100g', defaultPortion: 10 },
    { name: 'Pollo (pechuga, sin piel)', cholesterol: 85, calories: 165, satFat: 1.0, unit: '100g', defaultPortion: 150 },
    { name: 'Carne de res (magra)', cholesterol: 90, calories: 217, satFat: 5.0, unit: '100g', defaultPortion: 150 },
    { name: 'Hígado de res', cholesterol: 372, calories: 135, satFat: 1.9, unit: '100g', defaultPortion: 100 },
    { name: 'Salmón', cholesterol: 63, calories: 208, satFat: 3.0, unit: '100g', defaultPortion: 150 },
    { name: 'Camarones', cholesterol: 189, calories: 99, satFat: 0.3, unit: '100g', defaultPortion: 100 },
    { name: 'Atún en agua', cholesterol: 30, calories: 116, satFat: 0.2, unit: '100g', defaultPortion: 80 },
    { name: 'Yogur natural entero', cholesterol: 13, calories: 61, satFat: 2.0, unit: '100g', defaultPortion: 150 },
    { name: 'Crema de leche', cholesterol: 137, calories: 340, satFat: 23, unit: '100g', defaultPortion: 30 },
    { name: 'Helado de crema', cholesterol: 44, calories: 207, satFat: 7.0, unit: '100g', defaultPortion: 100 },
    { name: 'Pan blanco', cholesterol: 0, calories: 265, satFat: 0.6, unit: '100g', defaultPortion: 40 },
    { name: 'Arroz blanco cocido', cholesterol: 0, calories: 130, satFat: 0.1, unit: '100g', defaultPortion: 150 },
    { name: 'Pasta cocida', cholesterol: 0, calories: 131, satFat: 0.1, unit: '100g', defaultPortion: 150 },
    { name: 'Manzana', cholesterol: 0, calories: 52, satFat: 0.0, unit: '100g', defaultPortion: 150 },
    { name: 'Plátano / Banana', cholesterol: 0, calories: 89, satFat: 0.1, unit: '100g', defaultPortion: 120 },
    { name: 'Aceite de oliva', cholesterol: 0, calories: 884, satFat: 14, unit: '100ml', defaultPortion: 10 },
    { name: 'Tocino / Bacon', cholesterol: 110, calories: 541, satFat: 19, unit: '100g', defaultPortion: 30 },
    { name: 'Jamón cocido', cholesterol: 53, calories: 145, satFat: 1.5, unit: '100g', defaultPortion: 50 },
    { name: 'Pizza margherita', cholesterol: 17, calories: 266, satFat: 4.5, unit: '100g', defaultPortion: 150 },
  ];

  // --- Storage helpers ---
  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  function getMeals(date) { return (load()[date] || []); }

  function saveMeal(date, meal) {
    var data = load();
    if (!data[date]) data[date] = [];
    data[date].push(meal);
    save(data);
  }

  function deleteMeal(date, id) {
    var data = load();
    if (!data[date]) return;
    data[date] = data[date].filter(function (m) { return m.id !== id; });
    save(data);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // --- Calculations ---
  function sumField(meals, field) {
    return meals.reduce(function (acc, m) { return acc + (parseFloat(m[field]) || 0); }, 0);
  }

  function scaleValue(valuePer100, portion) {
    return (valuePer100 * portion) / 100;
  }

  // --- UI rendering ---
  function render() {
    var meals = getMeals(currentDate);

    // Totals
    var totalCholesterol = sumField(meals, 'cholesterol');
    var totalCalories = sumField(meals, 'calories');
    var totalSatFat = sumField(meals, 'satFat');

    document.getElementById('total-cholesterol').innerHTML = totalCholesterol.toFixed(1) + ' <small>mg</small>';
    document.getElementById('total-calories').innerHTML = totalCalories.toFixed(0) + ' <small>kcal</small>';
    document.getElementById('total-sat-fat').innerHTML = totalSatFat.toFixed(1) + ' <small>g</small>';
    document.getElementById('total-meals').textContent = meals.length;

    // Progress bar
    var pct = Math.min((totalCholesterol / DAILY_LIMIT) * 100, 100);
    var bar = document.getElementById('cholesterol-bar');
    bar.style.width = pct + '%';
    var card = document.getElementById('card-cholesterol');
    card.className = 'stat-card';
    if (totalCholesterol > DAILY_LIMIT) {
      bar.style.background = '#d9534f';
      card.classList.add('danger');
    } else if (totalCholesterol > DAILY_LIMIT * 0.75) {
      bar.style.background = '#f0ad4e';
      card.classList.add('warning');
    } else {
      bar.style.background = '#5cb85c';
      card.classList.add('success');
    }

    // Table
    var tbody = document.getElementById('meals-body');
    tbody.innerHTML = '';
    if (meals.length === 0) {
      tbody.innerHTML = '<tr id="empty-row"><td colspan="8" class="text-center text-muted">No hay comidas registradas hoy.</td></tr>';
    } else {
      meals.forEach(function (m) {
        var tr = document.createElement('tr');
        tr.className = 'meal-row';
        tr.innerHTML =
          '<td><span class="label label-default">' + esc(m.time) + '</span></td>' +
          '<td><strong>' + esc(m.name) + '</strong></td>' +
          '<td>' + m.portion + ' g/ml</td>' +
          '<td><strong>' + parseFloat(m.cholesterol).toFixed(1) + ' mg</strong></td>' +
          '<td>' + (m.calories ? parseFloat(m.calories).toFixed(0) + ' kcal' : '-') + '</td>' +
          '<td>' + (m.satFat ? parseFloat(m.satFat).toFixed(1) + ' g' : '-') + '</td>' +
          '<td class="text-muted"><small>' + esc(m.notes || '') + '</small></td>' +
          '<td><button class="btn btn-xs btn-danger" onclick="MealTracker.remove(\'' + m.id + '\')">✕</button></td>';
        tbody.appendChild(tr);
      });
    }

    renderWeeklyChart();
  }

  function renderWeeklyChart() {
    var container = document.getElementById('weekly-chart');
    container.innerHTML = '';
    var today = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var dateStr = d.toISOString().slice(0, 10);
      var meals = getMeals(dateStr);
      var total = sumField(meals, 'cholesterol');
      var pct = Math.min((total / DAILY_LIMIT) * 100, 100);
      var color = total > DAILY_LIMIT ? '#d9534f' : total > DAILY_LIMIT * 0.75 ? '#f0ad4e' : '#5cb85c';
      var label = i === 0 ? 'Hoy' : d.toLocaleDateString('es', { weekday: 'short' });
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;margin-bottom:5px;font-size:13px;';
      row.innerHTML =
        '<span style="width:45px;text-align:right;margin-right:8px;color:#666;">' + label + '</span>' +
        '<div style="flex:1;background:#e0e0e0;border-radius:3px;height:16px;">' +
        '<div style="width:' + pct + '%;background:' + color + ';height:16px;border-radius:3px;transition:width 0.4s;"></div></div>' +
        '<span style="width:60px;text-align:right;margin-left:8px;">' + total.toFixed(0) + ' mg</span>';
      container.appendChild(row);
    }
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // --- Food autocomplete ---
  function setupAutocomplete() {
    var input = document.getElementById('food-name');
    var suggestions = document.getElementById('food-suggestions');

    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      suggestions.innerHTML = '';
      if (!q) { suggestions.style.display = 'none'; return; }
      var matches = FOOD_DB.filter(function (f) { return f.name.toLowerCase().indexOf(q) !== -1; });
      if (matches.length === 0) { suggestions.style.display = 'none'; return; }
      matches.slice(0, 8).forEach(function (f) {
        var item = document.createElement('div');
        item.className = 'food-suggestion-item';
        item.innerHTML = '<strong>' + esc(f.name) + '</strong> <small class="text-muted">— ' + f.cholesterol + ' mg col./100g</small>';
        item.addEventListener('mousedown', function (e) {
          e.preventDefault();
          input.value = f.name;
          document.getElementById('food-portion').value = f.defaultPortion;
          fillFromDB(f, f.defaultPortion);
          suggestions.style.display = 'none';
        });
        suggestions.appendChild(item);
      });
      suggestions.style.display = 'block';
    });

    document.addEventListener('click', function (e) {
      if (e.target !== input) suggestions.style.display = 'none';
    });

    // Auto-fill values when portion changes
    document.getElementById('food-portion').addEventListener('input', function () {
      var name = input.value.toLowerCase().trim();
      var food = FOOD_DB.find(function (f) { return f.name.toLowerCase() === name; });
      if (food) fillFromDB(food, parseFloat(this.value) || 100);
    });
  }

  function fillFromDB(food, portion) {
    document.getElementById('food-cholesterol').value = scaleValue(food.cholesterol, portion).toFixed(1);
    document.getElementById('food-calories').value = scaleValue(food.calories, portion).toFixed(1);
    document.getElementById('food-sat-fat').value = scaleValue(food.satFat, portion).toFixed(1);
  }

  // --- Form submit ---
  function setupForm() {
    document.getElementById('meal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var meal = {
        id: genId(),
        time: document.getElementById('meal-time').value,
        name: document.getElementById('food-name').value.trim(),
        portion: parseFloat(document.getElementById('food-portion').value) || 0,
        cholesterol: parseFloat(document.getElementById('food-cholesterol').value) || 0,
        calories: parseFloat(document.getElementById('food-calories').value) || 0,
        satFat: parseFloat(document.getElementById('food-sat-fat').value) || 0,
        notes: document.getElementById('food-notes').value.trim(),
      };
      saveMeal(currentDate, meal);
      this.reset();
      document.getElementById('food-portion').value = 100;
      render();
    });
  }

  // --- Date picker ---
  function setupDatePicker() {
    var picker = document.getElementById('date-picker');
    picker.value = currentDate;
    document.getElementById('current-date').textContent = new Date(currentDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    picker.addEventListener('change', function () {
      currentDate = this.value;
      document.getElementById('current-date').textContent = new Date(currentDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      render();
    });
  }

  // --- Public methods ---
  function remove(id) {
    if (confirm('¿Eliminar esta entrada?')) {
      deleteMeal(currentDate, id);
      render();
    }
  }

  function clearDay() {
    if (confirm('¿Borrar todas las comidas del día ' + currentDate + '?')) {
      var data = load();
      delete data[currentDate];
      save(data);
      render();
    }
  }

  function exportCSV() {
    var data = load();
    var rows = [['Fecha', 'Momento', 'Alimento', 'Porción (g/ml)', 'Colesterol (mg)', 'Calorías (kcal)', 'Grasas Sat. (g)', 'Notas']];
    Object.keys(data).sort().forEach(function (date) {
      data[date].forEach(function (m) {
        rows.push([date, m.time, m.name, m.portion, m.cholesterol, m.calories, m.satFat, m.notes]);
      });
    });
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'registro_comidas.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Init ---
  function init() {
    setupAutocomplete();
    setupForm();
    setupDatePicker();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { remove: remove, clearDay: clearDay, exportCSV: exportCSV };
})();
