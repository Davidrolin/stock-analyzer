package com.example.StockAnalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EarningsRecord {

    private String fiscalDateEnding;
    private double reportedEPS;

    public EarningsRecord() {}

    public EarningsRecord(String fiscalDateEnding, double reportedEPS) {
        this.fiscalDateEnding = fiscalDateEnding;
        this.reportedEPS = reportedEPS;
    }

    public String getFiscalDateEnding() {
        return fiscalDateEnding;
    }

    public double getReportedEPS() {
        return reportedEPS;
    }
}