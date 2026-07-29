package com.example.StockAnalyzer.service;

import com.example.StockAnalyzer.client.StockApiClient;
import com.example.StockAnalyzer.model.*;
import com.example.StockAnalyzer.model.EarningsRecord;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.ArrayList;

@Service
public class CompanyService {
    private final StockApiClient stockApiClient;

    public CompanyService(StockApiClient stockApiClient) {
        this.stockApiClient = stockApiClient;
    }

    @Cacheable(value = "stockData", key = "#ticker")
    public StockAnalysis getAnalysis(String ticker) {
        var prices = stockApiClient.getPrices(ticker);

        // Vi sätter upp en tom lista som standard
        var earnings = new ArrayList<EarningsRecord>();

        try {
            // Lägg in en liten paus för att undvika Alpha Vantages spam-filter
            Thread.sleep(2000);

            earnings = (ArrayList<EarningsRecord>) stockApiClient.getEarnings(ticker);
        } catch (Exception e) {
            System.err.println("Kunde inte hämta vinstdata, returnerar tom lista. Orsak: " + e.getMessage());
            // Frontend kommer nu få priserna, men en tom lista för earnings istället för en 500-krasch
        }

        return new StockAnalysis(ticker, prices, earnings);
    }
}