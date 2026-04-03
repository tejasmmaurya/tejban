const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Premium PDF Generation Service
 * Converts HTML template with injected data to professional PDF
 */

class PremiumPDFGenerator {
  constructor() {
    this.browser = null;
  }

  /**
   * Initialize Puppeteer browser (call once per session)
   */
  async initialize() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      } catch (error) {
        console.error('Failed to launch Puppeteer:', error);
        require('fs').writeFileSync(require('path').join(__dirname, '..', '..', 'pdf_launch_error.txt'), String(error.stack || error.message));
        throw new Error('PDF generation service failed to initialize: ' + error.message);
      }
    }
  }

  /**
   * Load HTML template
   */
  loadTemplate(templatePath) {
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error('Failed to load template:', error);
      throw new Error(`Template not found at ${templatePath}`);
    }
  }

  /**
   * Inject data into HTML template
   */
  injectData(html, data) {
    let result = html;

    // Replace all {{key}} patterns with corresponding data values
    Object.keys(data).forEach((key) => {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const value = data[key] !== null && data[key] !== undefined ? data[key] : '';
      result = result.replace(pattern, value);
    });

    return result;
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(htmlContent, outputPath) {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    try {
      // Set content with fast resolution
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Generate PDF with premium settings
      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        printBackground: true,
        displayHeaderFooter: false,
        scale: 1
      });

      console.log(`PDF generated successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('PDF generation failed:', error);
      require('fs').writeFileSync(require('path').join(__dirname, '..', '..', 'pdf_generator_error.txt'), String(error.stack || error.message));
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Complete workflow: Load template → Inject data → Generate PDF
   */
  async createPremiumReport(templatePath, data, outputPath) {
    try {
      // Load template
      const template = this.loadTemplate(templatePath);

      // Inject dynamic data
      const htmlWithData = this.injectData(template, data);

      // Generate PDF
      const pdfPath = await this.generatePDF(htmlWithData, outputPath);

      return {
        success: true,
        path: pdfPath,
        message: 'Premium startup report generated successfully'
      };
    } catch (error) {
      console.error('Report generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup: Close browser when done
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = PremiumPDFGenerator;
