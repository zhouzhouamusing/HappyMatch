package com.happymatch.dto;

public class ShopPurchaseRequest {
    private String itemType;
    private Integer quantity = 1;

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
