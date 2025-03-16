from flask import Flask, jsonify
# from main import run_security_audit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/pentesting', methods=['POST'])
def pentesting():
    # Define the allowed scope
    # allowed_domains = ["localhost"]
    # allowed_ip_ranges = ["192.0.0.2"]
    # allowed_domains = ["localhost"]
    # allowed_ip_ranges = ["192.0.0.2"]
    
    # # Set the security objective
    # objective = """Perform a comprehensive security assessment of 192.0.0.2. 
    # Identify open ports, discover hidden directories, and test for common web vulnerabilities 
    # including SQL injection. Ensure all tests are non-intrusive and respect the target scope."""
    # # Set the security objective
    # objective = """Perform a comprehensive security assessment of 192.0.0.2. 
    # Identify open ports, discover hidden directories, and test for common web vulnerabilities 
    # including SQL injection. Ensure all tests are non-intrusive and respect the target scope."""
    
    # # Run the security audit
    # report = run_security_audit(objective, allowed_domains, allowed_ip_ranges)
    # # Run the security audit
    # report = run_security_audit(objective, allowed_domains, allowed_ip_ranges)
    
    # Return the path to the report
    report_path = "C:\\Users\\HP\\Desktop\\TGBH_CheeseBurger\\intelligence\\security_report.md"  # Adjust this to the actual path where the report is saved
    return jsonify({"reportPath": report_path})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)