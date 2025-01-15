jQuery(document).ready(function($) {
    const apiBaseUrl = geoLocationData.apiBaseUrl;

    // Fetch data from API
    async function fetchData(endpoint) {
        try {
            const response = await $.getJSON(`${apiBaseUrl}${endpoint}`);
            return response;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return [];
        }
    }

    // Populate dropdown with both English and Bengali names
    function populateDropdown(dropdown, data, idField, nameField, defaultText) {
        dropdown.empty().append(`<option value="">${defaultText}</option>`);
        data.forEach(item => {
            dropdown.append(`
                <option value="${item[idField]}" data-bn_name="${item.bn_name || ''}">
                    ${item[nameField]} (${item.bn_name || ''})
                </option>
            `);
        });
        dropdown.prop('disabled', false);
    }

    // Reset dropdowns
    function resetDropdowns(startFrom) {
        const dropdowns = ['district', 'upazila', 'union'];
        const startIndex = dropdowns.indexOf(startFrom);
        
        if (startIndex !== -1) {
            dropdowns.slice(startIndex).forEach(type => {
                $(`#${type}-dropdown`)
                    .empty()
                    .append(`<option value="">Select ${type.charAt(0).toUpperCase() + type.slice(1)}</option>`)
                    .prop('disabled', true);
            });
        }
    }

    // Update selected data cards
    function updateSelectedDataCards() {
        $("#selected-data-cards").empty();
        
        const selections = [
            {
                type: 'Division',
                element: $("#division-dropdown option:selected"),
                icon: '🏛️'
            },
            {
                type: 'District',
                element: $("#district-dropdown option:selected"),
                icon: '🏢'
            },
            {
                type: 'Upazila',
                element: $("#upazila-dropdown option:selected"),
                icon: '🏫'
            },
            {
                type: 'Union',
                element: $("#union-dropdown option:selected"),
                icon: '🏘️'
            }
        ];

        selections.forEach(({ type, element, icon }) => {
            if (element.val()) {
                const name = element.text().split('(')[0].trim();
                const bnName = element.data('bn_name');
                const card = `
                    <div class="location-card">
                        <div class="card-header">
                            <span class="location-icon">${icon}</span>
                            <span class="location-type">${type}</span>
                            <button class="remove-card" data-type="${type.toLowerCase()}">×</button>
                        </div>
                        <div class="card-body">
                            <h3 class="location-name">${name}</h3>
                            <p class="location-bn-name">${bnName || ''}</p>
                        </div>
                    </div>
                `;
                $("#selected-data-cards").append(card);
            }
        });
    }

    // Load and cache data
    async function loadAllData() {
        const storedData = localStorage.getItem('geo_location_data');
        if (storedData && JSON.parse(storedData).timestamp > Date.now() - 86400000) {
            return JSON.parse(storedData).data;
        }

        try {
            const [divisions, districts, upazilas, unions] = await Promise.all([
                fetchData('divisions'),
                fetchData('districts'),
                fetchData('upazilas'),
                fetchData('unions')
            ]);

            const data = { divisions, districts, upazilas, unions };
            localStorage.setItem('geo_location_data', JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Initialize
    loadAllData().then(data => {
        if (!data) return;

        populateDropdown($("#division-dropdown"), data.divisions, 'id', 'name', 'Select Division');

        // Division change handler
        $("#division-dropdown").on("change", function() {
            const divisionId = $(this).val();
            resetDropdowns('district');
            
            if (divisionId) {
                const districts = data.districts.filter(d => d.division_id === divisionId);
                populateDropdown($("#district-dropdown"), districts, 'id', 'name', 'Select District');
                updateSelectedDataCards();
            }
        });

        // District change handler
        $("#district-dropdown").on("change", function() {
            const districtId = $(this).val();
            resetDropdowns('upazila');
            
            if (districtId) {
                const upazilas = data.upazilas.filter(u => u.district_id === districtId);
                populateDropdown($("#upazila-dropdown"), upazilas, 'id', 'name', 'Select Upazila');
                updateSelectedDataCards();
            }
        });

        // Upazila change handler
        $("#upazila-dropdown").on("change", function() {
            const upazilaId = $(this).val();
            resetDropdowns('union');
            
            if (upazilaId) {
                const unions = data.unions.filter(u => String(u.upazilla_id) === String(upazilaId));
                populateDropdown($("#union-dropdown"), unions, 'id', 'name', 'Select Union');
                updateSelectedDataCards();
            }
        });

        // Union change handler
        $("#union-dropdown").on("change", function() {
            updateSelectedDataCards();
        });

        // Remove card handler
        $(document).on('click', '.remove-card', function() {
            const type = $(this).data('type');
            $(`#${type}-dropdown`).val('').trigger('change');
        });
    });
});
