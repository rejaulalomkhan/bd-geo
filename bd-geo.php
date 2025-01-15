<?php
/**
 * Plugin Name: Bangladeshi Locations
 * Description: A plugin to display cascading dropdowns for Bangladeshi divisions, districts, upazilas, and unions. [geo_location_dropdowns] shortcode.
 * Version: 1.0.0
 * Author: Arman azij
 * Author URI: https://facebook.com/armanaazij
 */

// Enqueue necessary scripts and styles
add_action('wp_enqueue_scripts', 'geo_location_enqueue_scripts');
function geo_location_enqueue_scripts() {
    wp_enqueue_script('geo-location-script', plugins_url('js/geo-location.js', __FILE__), ['jquery'], '1.0.0', true);
    wp_localize_script('geo-location-script', 'geoLocationData', [
        'apiBaseUrl' => 'https://bagnladesh-geo-locations.vercel.app/api/'
    ]);
    wp_enqueue_style('geo-location-style', plugins_url('css/geo-location.css', __FILE__));
}

// Shortcode for rendering dropdowns
add_shortcode('geo_location_dropdowns', 'geo_location_render_dropdowns');

function geo_location_render_dropdowns() {
    ob_start();
    ?>
    <div id="geo-location-container">
        <div class="dropdowns">
            <div class="form-group">
                <label for="division-dropdown" style="font-weight: bold;">Division</label>
                <select id="division-dropdown" class="form-control">
                    <option value="">Select Division</option>
                </select>
            </div>
            <div class="form-group">
                <label for="district-dropdown" style="font-weight: bold;">District</label>
                <select id="district-dropdown" class="form-control" disabled>
                    <option value="">Select District</option>
                </select>
            </div>
            <div class="form-group">
                <label for="upazila-dropdown" style="font-weight: bold;">Upazila</label>
                <select id="upazila-dropdown" class="form-control" disabled>
                    <option value="">Select Upazila</option>
                </select>
            </div>
            <div class="form-group">
                <label for="union-dropdown" style="font-weight: bold;">Union</label>
                <select id="union-dropdown" class="form-control" disabled>
                    <option value="">Select Union</option>
                </select>
            </div>
        </div>
        <div id="selected-data-cards" class="cards-container"></div>
    </div>
    <?php
    return ob_get_clean();
}
