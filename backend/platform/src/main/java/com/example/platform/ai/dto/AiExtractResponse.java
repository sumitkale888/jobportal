package com.example.platform.ai.dto;

import lombok.Data;

@Data
public class AiExtractResponse {
    private String filename;
    private String text;
    private String error;
}