package com.example.StockAnalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StockPrice {

    private String date;

    private double close;

    public StockPrice() {
    }

    public StockPrice(String date, double close) {
        this.date = date;
        this.close = close;
    }

    public String getDate() {
        return date;
    }

    public double getClose() {
        return close;
    }
}
