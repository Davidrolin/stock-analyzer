package com.example.StockAnalyzer.model;

import java.util.List;

public record StockAnalysis(String ticker, List<com.example.StockAnalyzer.model.StockPrice> prices, List<com.example.StockAnalyzer.model.EarningsRecord> earnings) {}