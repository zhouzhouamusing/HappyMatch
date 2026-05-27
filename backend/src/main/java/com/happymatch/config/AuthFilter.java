package com.happymatch.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Component
@Order(1)
public class AuthFilter implements Filter {

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/security-question",
            "/api/auth/reset-password"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpReq = (HttpServletRequest) request;
        HttpServletResponse httpResp = (HttpServletResponse) response;

        String path = httpReq.getRequestURI();

        // Allow non-API requests and public auth endpoints
        if (!path.startsWith("/api/") || isPublicPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // Check authentication for protected endpoints
        HttpSession session = httpReq.getSession(false);
        Long userId = null;
        if (session != null) {
            userId = (Long) session.getAttribute("userId");
        }

        if (userId == null) {
            httpResp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResp.setContentType("application/json;charset=UTF-8");
            httpResp.getWriter().write("{\"success\":false,\"code\":401,\"message\":\"未登录或登录已过期，请重新登录\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        for (String publicPath : PUBLIC_PATHS) {
            if (path.equals(publicPath)) {
                return true;
            }
        }
        return false;
    }
}
