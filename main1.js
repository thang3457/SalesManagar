const tableProducts = document.querySelector("#productTable");
const tableReceiptApi = document.querySelector("#receiptTable");
const sendBtn = document.querySelector("#send");
const workfirst = document.querySelector(".view");
const tableProduct = document.querySelector("#tablefirst");
const tableReceiptTableDetail = document.querySelector("#ReceiptTableDetail");
// Biến để theo dõi trạng thái hiển thị danh sách sản phẩm
var productListVisible = false;

// Mảng để lưu trữ thông tin sản phẩm
var products = [];

// Biến để lưu trữ thông tin về hóa đơn nhập hàng
var importBills = [];

// Biến để theo dõi trạng thái hiển thị form tạo phiếu nhập
var receiptFormVisible = false;

// Mảng để lưu trữ thông tin về các phiếu nhập hàng
var receipts = [];

// Mảng để lưu trữ thông tin chi tiết các phiếu nhập hàng
var receiptDetails = [];

// Sự kiện xảy ra khi DOM đã được tải
document.addEventListener("DOMContentLoaded", function () {
  // Tạo một đối tượng XMLHttpRequest để tương tác với server
  var xhr = new XMLHttpRequest();

  // Xử lý sự kiện khi trạng thái của request thay đổi
  xhr.onreadystatechange = function () {
    // Kiểm tra nếu request đã hoàn thành và có mã trạng thái là 200 (OK)
    if (xhr.readyState == 4 && xhr.status == 200) {
      // Parse dữ liệu JSON từ response và gán cho mảng 'products'
      products = JSON.parse(xhr.responseText);
      // Khởi tạo ứng dụng sau khi có dữ liệu
      start();
    }
  };
  // Mở một kết nối đến server để lấy dữ liệu từ tệp JSON
  xhr.open("GET", "products.json", true);

  // Gửi request đến server
  xhr.send();
});

function start() {
  populateProductOptions();
  viewProductList();
  openModal();
}

// Sử dụng destructuring
function populateProductOptions() {
  var productSelect = document.getElementById("productId");
  products.forEach((product) => {
    var option = document.createElement("option");
    option.value = product.id;
    option.text = product.name;
    productSelect.add(option);
  });
}
function toggleProductList() {
  // Đảo ngược giá trị của biến productListVisible
  productListVisible = !productListVisible;

  // Ẩn hoặc hiển thị danh sách sản phẩm dựa vào giá trị mới của productListVisible
  toggleVisibility(productListVisible);

  // Nếu danh sách được hiển thị, thì gọi hàm để hiển thị lại danh sách sản phẩm
  if (productListVisible) {
    viewProductList();
  }
}

// Hàm ẩn hoặc hiển thị một phần tử trên trang web
function toggleVisibility(isVisible) {
  // Lấy phần tử từ DOM dựa trên id
  var element = document.getElementById("workfirst");

  // Đặt thuộc tính display của phần tử dựa vào giá trị isVisible
  element.style.display = isVisible ? "block" : "none";
}

function viewProductList() {
  var list = document.getElementById("list");

  // Sử dụng vòng lặp để xóa tất cả các dòng trong bảng (trừ dòng header)
  for (var i = list.rows.length - 1; i > 0; i--) {
    list.deleteRow(i);
  }
  // Lặp qua mảng sản phẩm và thêm các dòng mới vào bảng
  for (var i = 0; i < products.length; i++) {
    // Tạo một dòng mới trong bảng
    var row = list.insertRow(-1);

    // Thêm các ô dữ liệu cho mỗi sản phẩm vào dòng
    var idCell = row.insertCell(0);
    idCell.innerHTML = products[i].id;
    var nameCell = row.insertCell(1);
    nameCell.innerHTML = products[i].name;
    var idCategoryCell = row.insertCell(2);
    idCategoryCell.innerHTML = products[i].idCategory;
    var priceInputCell = row.insertCell(3);
    priceInputCell.innerHTML = products[i].priceInput;
    var priceOutputCell = row.insertCell(4);
    priceOutputCell.innerHTML = calculatePriceOutput(products[i].priceInput);
  }
}

function calculatePriceOutput(priceInput) {
  var tax = priceInput * 0.1;
  var profit = priceInput * 0.3;
  return priceInput + tax + profit;
}

// // tính năng hai

// Hàm xử lý khi người dùng nhấn nút submit trên form tạo phiếu nhập
function submitReceipt() {
  // Lấy giá trị từ các trường input trong form
  var receiptId = document.querySelector("input[name='idReceipt']").value;
  var userName = document.querySelector("input[name='username']").value;
  var productId = document.querySelector("#productId").value;
  var quantity = parseInt(
    document.querySelector("input[name='quantity']").value,
    10
  );
  var createdAt = new Date().toLocaleString();
  var selectedProduct = products.find((p) => p.id === productId);
  var priceOutputForDetail = calculatePriceOutputfordetal(
    selectedProduct.priceInput,
    quantity
  );

  // Thêm thông tin chi tiết phiếu nhập vào bảng tham chiếu
  receiptDetails.push({
    id: receiptDetails.length + 1,
    idReceipt: receiptId,
    idProduct: productId,
    name: selectedProduct.name,
    idCategory: selectedProduct.idCategory,
    priceInput: selectedProduct.priceInput,
    priceOutput: priceOutputForDetail,
    quantity: quantity,
  });
  var existingReceiptIndex = receipts.findIndex((r) => r.id === receiptId);
  if (existingReceiptIndex !== -1) {
    receipts[existingReceiptIndex].total += priceOutputForDetail;
    receipts[existingReceiptIndex].quantity += quantity;
  } else {
    // Thêm thông tin phiếu nhập vào bảng tham chiếu nếu phiếu chưa tồn tại
    receipts.push({
      id: receiptId,
      userName: userName,
      quantity: quantity,
      total: priceOutputForDetail, // Gán giá trị ban đầu
      createdAt: createdAt,
    });
  }

  // Cập nhật bảng tham chiếu
  updateReferenceTables();
}
//tính toán ouput cho total
function calculatePriceOutputfordetal(priceInput, quantity) {
  var priceOutput = priceInput * quantity;

  // Làm tròn giá trị đầu ra nếu cần
  priceOutput = Math.round(priceOutput * 100) / 100;

  return priceOutput;
}

// Hàm cập nhật bảng tham chiếu sau khi có sự thay đổi
function updateReferenceTables() {
  // Hiển thị lại bảng thông tin các phiếu nhập và chi tiết phiếu nhập
  viewReceipts();
  viewReceiptDetails();
}

// Sử dụng map()
function viewReceipts() {
  var receiptList = document.getElementById("receiptList");
  // Nếu hàng đầu tiên chưa tồn tại, thêm nó vào
  if (receiptList.getElementsByTagName("tr").length === 0) {
    var headerRow = receiptList.insertRow(0);
    headerRow.innerHTML =
      "<th>Id</th><th>UserName</th><th>Quantity</th><th>Total</th><th>CreatedAt</th>";
  }

  // Xóa nội dung bảng (ngoại trừ hàng đầu tiên)
  while (receiptList.rows.length > 1) {
    receiptList.deleteRow(1);
  }
  receipts.map((receipt) => {
    var row = receiptList.insertRow(-1);
    row.insertCell(0).innerHTML = receipt.id;
    row.insertCell(1).innerHTML = receipt.userName;
    row.insertCell(2).innerHTML = receipt.quantity;
    row.insertCell(3).innerHTML = receipt.total;
    row.insertCell(4).innerHTML = receipt.createdAt;
  });
}

// Hàm hiển thị thông tin chi tiết của các phiếu nhập
function viewReceiptDetails() {
  var receiptDetailList = document.getElementById("receiptDetailList");
  clearTable(receiptDetailList);

  // Duyệt qua mảng chi tiết phiếu nhập và thêm thông tin vào bảng
  for (var i = 0; i < receiptDetails.length; i++) {
    var row = receiptDetailList.insertRow(-1);
    row.insertCell(0).innerHTML = receiptDetails[i].id;
    row.insertCell(1).innerHTML = receiptDetails[i].idReceipt;
    row.insertCell(2).innerHTML = receiptDetails[i].idProduct;
    row.insertCell(3).innerHTML = receiptDetails[i].name;
    row.insertCell(4).innerHTML = receiptDetails[i].idCategory;
    row.insertCell(5).innerHTML = receiptDetails[i].priceInput;
    row.insertCell(6).innerHTML = receiptDetails[i].priceOutput;
    row.insertCell(7).innerHTML = receiptDetails[i].quantity;
  }
}
function getReceiptCreatedAt(receiptId) {
  var receipt = receipts.find((r) => r.id === receiptId);
  return receipt ? receipt.createdAt : "";
}

// Hàm lấy ngày hiện tại dưới định dạng chuỗi
function getCurrentDate() {
  var currentDate = new Date();
  return currentDate.toLocaleDateString();
}

function clearTable(table) {
  var rowCount = table.rows.length;
  // Sử dụng vòng lặp từ rowCount - 1 để 1 để xóa tất cả các dòng, không xóa dòng header
  for (var i = rowCount - 1; i >= 1; i--) {
    table.deleteRow(i);
  }
}

function openModal() {
  document
    .querySelector(".open-modal-btn")
    .addEventListener("click", function () {
      document.getElementById("myModal").style.display = "block";
    });

  closeModal();
}

function closeModal() {
  document
    .querySelector(".close-modal-btn")
    .addEventListener("click", function () {
      document.getElementById("myModal").style.display = "none";
    });
}

window.onclick = function (event) {
  var modal = document.getElementById("myModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
// ẩn tính năng hai
function hideShowfeature2() {
  var tableSecond = document.getElementById("tableSecond");

  // Get the computed style to ensure an accurate value
  var displayStyle = window.getComputedStyle(tableSecond).display;

  if (displayStyle === "none" || displayStyle === "") {
    tableSecond.style.display = "block";
  } else {
    tableSecond.style.display = "none";
  }
}

function hideShowfeature3() {
  var tabeThird = document.getElementById("tabeThird");

  // Get the computed style to ensure an accurate value
  var displayStyle = window.getComputedStyle(tabeThird).display;

  if (displayStyle === "none" || displayStyle === "") {
    tabeThird.style.display = "block";
  } else {
    tabeThird.style.display = "none";
  }
}
//tính năng 4

// Hàm hiển thị danh sách sản phẩm theo ngày
function viewItemListByDate() {
  var itemListByDateTable = document.getElementById("itemListByDateTable");
  clearTable(itemListByDateTable);

  // Đối tượng để lưu trữ số lượng sản phẩm theo mã sản phẩm
  var itemQuantities = {};

  // Duyệt qua danh sách chi tiết phiếu nhập và tính tổng số lượng cho mỗi sản phẩm
  for (var i = 0; i < receiptDetails.length; i++) {
    var receiptDetail = receiptDetails[i];
    var createdAt = getReceiptCreatedAt(receiptDetail.idReceipt);

    // Nếu chưa có sản phẩm này trong đối tượng, tạo mới
    if (!itemQuantities[receiptDetail.idProduct]) {
      itemQuantities[receiptDetail.idProduct] = {
        name: receiptDetail.name,
        quantity: 0,
      };
    }

    // Cộng dồn số lượng sản phẩm
    itemQuantities[receiptDetail.idProduct].quantity += parseInt(
      receiptDetail.quantity
    );
  }

  // Hiển thị thông tin trong bảng
  for (var itemId in itemQuantities) {
    var item = itemQuantities[itemId];
    var row = itemListByDateTable.insertRow(-1);
    row.insertCell(0).innerHTML = itemId;
    row.insertCell(1).innerHTML = item.name;
    row.insertCell(2).innerHTML = item.quantity;
    row.insertCell(3).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
  }
}

function hideShowfeature4() {
  var itemListByDateVisible = true;

  if (itemListByDateVisible) {
    viewItemListByDate();
  }
  var tableFourth = document.getElementById("tableFourth");

  // Get the computed style to ensure an accurate value
  var displayStyle = window.getComputedStyle(tableFourth).display;

  if (displayStyle === "none" || displayStyle === "") {
    tableFourth.style.display = "block";
  } else {
    tableFourth.style.display = "none";
  }
}

function viewStock() {
  // Đặt trạng thái hiển thị của bảng tồn kho là true
  var stockListVisible = true;

  // Nếu bảng tồn kho được hiển thị, thì gọi hàm để hiển thị lại bảng tồn kho và danh sách phiếu nhập tồn kho
  if (stockListVisible) {
    viewStockList();
    viewStockReceiptList();
  }
}

//tính năng tồn kho
// Hàm hiển thị bảng tồn kho
// function viewStockList() {
//     var stockListTable = document.getElementById("stockList");
//     clearTable(stockListTable);

//     // Duyệt qua mảng sản phẩm và thêm thông tin vào bảng tồn kho
//     for (var i = 0; i < products.length; i++) {
//         var row = stockListTable.insertRow(-1);
//         row.insertCell(0).innerHTML = products[i].id;
//         row.insertCell(1).innerHTML = products[i].name;
//         row.insertCell(2).innerHTML = products[i].idCategory;
//         row.insertCell(3).innerHTML = products[i].priceInput;
//         row.insertCell(4).innerHTML = calculatePriceOutput(products[i].priceInput);
//     }
// }

// // Hàm hiển thị danh sách phiếu nhập tồn kho
// function viewStockReceiptList() {
//     var stockReceiptListTable = document.getElementById("stockReceiptList");
//     clearTable(stockReceiptListTable);

//     // Duyệt qua mảng phiếu nhập và thêm thông tin vào bảng phiếu nhập tồn kho
//     for (var i = 0; i < receipts.length; i++) {
//         var row = stockReceiptListTable.insertRow(-1);
//         row.insertCell(0).innerHTML = receipts[i].id;
//         row.insertCell(1).innerHTML = receipts[i].userName;
//         row.insertCell(2).innerHTML = calculateTotalQuantity(receipts[i].id);
//         row.insertCell(3).innerHTML = calculateTotalPrice(receipts[i].id);
//         row.insertCell(4).innerHTML = receipts[i].createdAt;
//     }
// }

//----------------
// Hàm tính tổng số lượng sản phẩm trong một phiếu nhập
function calculateTotalQuantity(receiptId) {
  var totalQuantity = 0;
  // Lặp qua từng chi tiết phiếu nhập
  for (var i = 0; i < receiptDetails.length; i++) {
    // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
    if (receiptDetails[i].idReceipt === receiptId) {
      // Cộng dồn số lượng cho chi tiết phiếu nhập tương ứng
      totalQuantity += parseInt(receiptDetails[i].quantity);
    }
  }
  // Trả về tổng số lượng cho receiptId đã chỉ định
  return totalQuantity;
}

// Hàm tính tổng giá trị của sản phẩm trong một phiếu nhập
function calculateTotalPrice(receiptId) {
  var totalPrice = 0;
  // Lặp qua từng chi tiết phiếu nhập
  for (var i = 0; i < receiptDetails.length; i++) {
    // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
    if (receiptDetails[i].idReceipt === receiptId) {
      // Tính giá tổng cộng cho chi tiết phiếu nhập tương ứng
      totalPrice +=
        parseInt(receiptDetails[i].quantity) *
        parseFloat(receiptDetails[i].priceInput);
    }
  }
  // Trả về giá tổng cộng cho receiptId đã chỉ định
  return totalPrice;
}
// Hàm xác nhận việc nhập kho
function enterWarehouse() {
  // Lấy mã phiếu nhập kho từ trường nhập liệu
  var warehouseId = document.getElementById("warehouseId").value;

  // Kiểm tra xem có phiếu nhập kho có mã tương ứng hay không
  var warehouseExists = receipts.some((r) => r.id === warehouseId);

  // Nếu có phiếu nhập kho tương ứng, gọi hàm để hiển thị chi tiết phiếu nhập kho
  if (warehouseExists) {
    viewImportReceiptDetails(warehouseId);
  } else {
    // Nếu không tìm thấy, thông báo lỗi
    alert("Không tìm thấy phiếu nhập kho với mã " + warehouseId);
  }
}

// Hàm hiển thị chi tiết phiếu nhập kho
function viewImportReceiptDetails(warehouseId) {
  // Lấy reference đến bảng hiển thị chi tiết phiếu nhập kho từ mã HTML
  var warehouseDetailListTable = document.getElementById("warehouseDetailList");

  // Xóa nội dung hiện tại của bảng chi tiết phiếu nhập kho
  clearTable(warehouseDetailListTable);

  // Duyệt qua mảng chi tiết phiếu nhập và thêm thông tin vào bảng chi tiết phiếu nhập kho
  for (var i = 0; i < receiptDetails.length; i++) {
    // Kiểm tra xem chi tiết phiếu nhập có thuộc về phiếu nhập kho có mã tương ứng không
    if (receiptDetails[i].idReceipt === warehouseId) {
      var row = warehouseDetailListTable.insertRow(-1);
      row.insertCell(0).innerHTML = receiptDetails[i].idReceipt;
      row.insertCell(1).innerHTML = receiptDetails[i].idProduct;
      row.insertCell(2).innerHTML = receiptDetails[i].name;
      row.insertCell(3).innerHTML = receiptDetails[i].idCategory;
      row.insertCell(4).innerHTML = receiptDetails[i].priceInput;
      row.insertCell(5).innerHTML = receiptDetails[i].priceOutput;
      row.insertCell(6).innerHTML = receiptDetails[i].quantity;
      row.insertCell(7).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
    }
  }
}

function hideShowfeature5() {
  var tableFifth = document.getElementById("tableFifth");

  // Get the computed style to ensure an accurate value
  var displayStyle = window.getComputedStyle(tableFifth).display;

  if (displayStyle === "none" || displayStyle === "") {
    tableFifth.style.display = "block";
  } else {
    tableFifth.style.display = "none";
  }
}

//tính năng 6
// Hàm cập nhật giá của sản phẩm
function updateProductPrices() {
  // Lấy giá trị mã sản phẩm và giá mới từ trường nhập liệu
  var updateProductId = document.getElementById("updateProductId").value;
  var updateProductPrice = document.getElementById("updateProductPrice").value;

  // Tìm sản phẩm cần cập nhật trong mảng sản phẩm
  var updatedProduct = products.find((p) => p.id == updateProductId);

  // Nếu sản phẩm được tìm thấy
  if (updatedProduct) {
    // Cập nhật giá nhập của sản phẩm và tính lại giá bán
    updatedProduct.priceInput = parseFloat(updateProductPrice);
    updatedProduct.priceOutput = calculatePriceOutput(
      updatedProduct.priceInput
    );

    // Cập nhật bảng hiển thị danh sách sản phẩm
    viewProductList();
  } else {
    // Nếu không tìm thấy sản phẩm, thông báo lỗi
    alert("Không tìm thấy sản phẩm với ID " + updateProductId);
  }
  // Hàm chuyển đổi trạng thái hiển thị danh sách sản phẩm
}
