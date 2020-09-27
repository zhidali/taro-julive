function statusColor(value) {
  if (value == 2) {
    return "#E1FBF3-#12C48E";
  } else if (value == 3) {
    return "#F0F4F5-#7E8C8F";
  } else if (value == 4 || value == 1) {
    return "#EFFBFE-#00C0EB";
  } else {
    return "#47B3E3-#666";
  }
}

function formatPrice(priceMap) {
  if (priceMap == undefined) {
    return "";
  }

  if (priceMap.price.length > 0) {
    if (priceMap.price[0] == "待定") {
      return "";
    }

    if (priceMap.price.length == 1) {
      return priceMap.price[0] + priceMap.unit;
    }

    if (priceMap.price.length == 2) {
      return (
        priceMap.price[0] +
        priceMap.unit +
        "-" +
        priceMap.price[1] +
        priceMap.unit
      );
    }
  }
  return "";
}

module.exports = { statusColor, formatPrice };
