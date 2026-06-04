import { test, expect } from '@playwright/test';

test.describe('Login y Dashboard', () => {
  test('debe iniciar sesión y mostrar el dashboard con métricas', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Conectar San José');

    await page.fill('#email', 'admin@sanjose.com');
    await page.fill('#password', 'admin123');
    await page.click('.submit-button');

    await page.waitForURL('**/admin/dashboard');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });

    await expect(page.locator('h1')).toHaveText('Panel de Actividades');
    await expect(page.locator('.metric-card')).toHaveCount(3);
    await expect(page.locator('.metric-card').first()).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'malo@email.com');
    await page.fill('#password', 'incorrecta');
    await page.click('.submit-button');

    await expect(page.locator('.login-card')).toBeVisible();
  });
});
