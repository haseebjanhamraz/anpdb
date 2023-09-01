  // Get the input element
  var searchInput = document.getElementById('searchInput');
  
  // Add an event listener to the search input
  searchInput.addEventListener('keyup', function() {
    // Get the user's search query and convert it to lowercase for case-insensitive search
    var searchQuery = searchInput.value.toLowerCase();
    
    // Get the table rows
    var table = document.querySelector('table');
    var rows = table.getElementsByTagName('tr');
    
    // Loop through the table rows, starting from the second row (index 1)
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var cells = row.getElementsByTagName('td');
      var matchFound = false; // Flag to check if a match is found in any cell
      
      // Loop through the cells in the row
      for (var j = 0; j < cells.length; j++) {
        var cell = cells[j];
        var cellValue = cell.textContent || cell.innerText;
        cellValue = cellValue.toLowerCase();
        
        // If the cell value contains the search query, display the row; otherwise, hide it
        if (cellValue.indexOf(searchQuery) > -1) {
          matchFound = true;
          break; // Exit the inner loop early if a match is found
        }
      }
      
      if (matchFound) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });