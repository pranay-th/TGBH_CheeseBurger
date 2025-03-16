import os
from flask import Flask, jsonify
from flask_cors import CORS  # If you need CORS

app = Flask(__name__)
CORS(app)  # If you need CORS

@app.route('/api/pentesting', methods=['POST'])
def pentesting():
    # Your existing POST code
    report_path = "../security_report.md"
    return jsonify({"reportPath": report_path})

@app.route('/api/pentesting/report', methods=['GET'])
def get_security_report():
    try:
        # Hardcoded security report content
        report_content = """# Security Audit Report for 192.0.0.2

## Executive Summary
This report summarizes the findings from the security audit conducted on the IP address 192.0.0.2. The audit focused on identifying open ports, hidden directories, and common web vulnerabilities, including SQL injection. The findings are categorized by risk level: critical, moderate, and low.

---

## Critical Vulnerabilities

### 1. Open Ports with Potential Risks
- **Description**: Multiple open ports were identified, including 3000 (ppp), 5000 (rtsp), 5432 (PostgreSQL), 5555 (http), 7000 (rtsp), and 8080 (http-proxy). Some of these services may be misconfigured or outdated, posing security risks.
- **Affected Targets**: All open ports on 192.0.0.2.
- **Potential Impact**: Unauthorized access, data leakage, or exploitation of vulnerabilities in outdated services could lead to data breaches or service disruptions.
- **Recommended Remediation Steps**:
  - Conduct a thorough review of the services running on these ports.
  - Ensure that all services are updated to the latest versions.
  - Implement firewall rules to restrict access to only necessary ports and services.
  - Consider disabling any unnecessary services.

---

## Moderate Vulnerabilities

### 2. Lack of Directory Discovery
- **Description**: The ffuf scan did not discover any hidden directories or endpoints, which may indicate a lack of proper web application security measures.
- **Affected Targets**: Web application hosted on 192.0.0.2.
- **Potential Impact**: While no immediate vulnerabilities were found, the absence of discovered endpoints may suggest that security measures are in place, or it may indicate a lack of thorough testing.
- **Recommended Remediation Steps**:
  - Implement a more comprehensive web application security assessment.
  - Regularly review and update security measures to ensure they are effective.

---

## Low-Risk Issues

### 3. SQL Injection Testing
- **Description**: The SQLMap scan confirmed that the target is not vulnerable to SQL injection attacks.
- **Affected Targets**: Web application hosted on 192.0.0.2.
- **Potential Impact**: No immediate risk as the application appears to be secure against SQL injection.
- **Recommended Remediation Steps**:
  - Continue to monitor and test for SQL injection vulnerabilities regularly.
  - Ensure that input validation and parameterized queries are consistently applied in the application code.

---

## Conclusion
The security audit of 192.0.0.2 revealed several critical and moderate vulnerabilities that require immediate attention. The presence of multiple open ports poses a significant risk, and it is essential to review and secure these services. Regular security assessments and updates are recommended to maintain a robust security posture."""

        return jsonify({
            "success": True,
            "content": report_content
        })

    except Exception as e:
        return jsonify({
            "error": "Failed to get report",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
