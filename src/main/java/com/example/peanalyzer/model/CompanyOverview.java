package com.example.StockAnalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CompanyOverview {

    @JsonProperty("Symbol")
    private String ticker;

    @JsonProperty("Name")
    private String name;

    public CompanyOverview() {
    }

    public String getTicker() {
        return ticker;
    }

    public String getName() {
        return name;
    }
}
