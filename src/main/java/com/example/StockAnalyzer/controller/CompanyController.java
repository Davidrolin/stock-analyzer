package com.example.StockAnalyzer.controller;

import com.example.StockAnalyzer.model.StockAnalysis;
import com.example.StockAnalyzer.service.CompanyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/{ticker}/analysis")
    public StockAnalysis getAnalysis(@PathVariable String ticker) {
        return companyService.getAnalysis(ticker);
    }
}