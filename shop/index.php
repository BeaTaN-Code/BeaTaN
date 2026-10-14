<?php
declare(strict_types=1);

/*
 * BeaTaN Shop — punto de entrada único.
 *
 * Producción en Hostinger (recomendado): el código privado vive FUERA de
 * public_html. Crea junto a este archivo un "beatan-root.php" con:
 *     <?php return '/home/uXXXXXXX/beatan_shop';
 * Si no existe, se asume la estructura del repositorio (carpeta padre).
 */
$rootFile = __DIR__ . '/beatan-root.php';
define('BEATAN_ROOT', is_file($rootFile) ? rtrim((string)require $rootFile, '/\\') : dirname(__DIR__));
define('BEATAN_PUBLIC', __DIR__);

require BEATAN_ROOT . '/app/bootstrap.php';
require BEATAN_ROOT . '/app/routes.php';
