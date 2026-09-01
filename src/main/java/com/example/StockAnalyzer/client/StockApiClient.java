package com.example.StockAnalyzer.client;

import com.example.StockAnalyzer.model.EarningsRecord;
import com.example.StockAnalyzer.model.StockPrice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class StockApiClient {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    @Value("${alphavantage.api.key}")
    private String apiKey;

    public StockApiClient() {
        this.restClient = RestClient.create();
    }

    public List<StockPrice> getPrices(String ticker) {
        String url = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol="
                + ticker + "&apikey=" + apiKey;

        String json = restClient.get().uri(url).retrieve().body(String.class);

        try {
            JsonNode root = objectMapper.readTree(json);

            JsonNode timeSeries = root.get("Weekly Adjusted Time Series");

            if (timeSeries == null) {
                throw new RuntimeException("Ingen prisdata hittades för: " + ticker);
            }

            List<StockPrice> prices = new ArrayList<>();
            timeSeries.fields().forEachRemaining(entry -> {
                String date = entry.getKey();

                double close = entry.getValue().get("5. adjusted close").asDouble();

                prices.add(new StockPrice(date, close));
            });
            return prices;

        } catch (Exception e) {
            throw new RuntimeException("Fel vid parsning av veckopriser", e);
        }
    }

    public List<EarningsRecord> getEarnings(String ticker) {
        String url = "https://www.alphavantage.co/query?function=EARNINGS&symbol="
                + ticker + "&apikey=" + apiKey;

        String json = restClient.get().uri(url).retrieve().body(String.class);
        System.out.println("DEBUG - API Svar för vinst: " + json);

        try {
            JsonNode root = objectMapper.readTree(json);

            JsonNode quarterlyEarnings = root.get("quarterlyEarnings");

            if (quarterlyEarnings == null) {
                throw new RuntimeException("Ingen vinstdata hittades för: " + ticker);
            }

            List<EarningsRecord> earnings = new ArrayList<>();

            quarterlyEarnings.forEach(node -> {
                String date = node.get("fiscalDateEnding").asText();
                double eps = node.get("reportedEPS").asDouble();
                earnings.add(new EarningsRecord(date, eps));
            });
            return earnings;

        } catch (Exception e) {
            throw new RuntimeException("Fel vid parsning av vinstdata", e);
        }
    }
}