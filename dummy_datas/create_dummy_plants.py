import os
import random
import requests
from requests.exceptions import RequestException

# Define the URL for the API endpoint
url = "http://localhost:3000/api/plants"

# Authentication token (replace with actual token)
auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWQwM2VkNDQ3ZDA5YWRmNTQ3Njc1ZSIsImlhdCI6MTcxNzM4NDk4OSwiZXhwIjoxNzE3Mzg4NTg5fQ.ACBvPTAcdl5KXBiRyjz4YmCZm_ojm5Iua-VOtut3PjU"

# Define the headers with authentication
headers = {"Authorization": f"Bearer {auth_token}"}


plants = [
    {
        "scientificName": "Aloe vera",
        "commonNames": ["Aloe", "Burn Plant", "Lily of the Desert"],
        "description": "Aloe vera is a succulent plant species of the genus Aloe.",
        "habitat": "Tropical climates worldwide.",
        "distribution": ["Africa", "Asia", "Europe", "America"],
        "medicinalUses": ["Skin treatment", "Digestive aid"],
        "chemicals": [
            {
                "name": "Aloin",
                "description": "A bitter, yellow-brown colored compound found in the exudate of some Aloe species.",
            },
            {
                "name": "Anthraquinone",
                "description": "A class of naturally occurring phenolic compounds used for medicinal purposes.",
            },
        ],
    },
    {
        "scientificName": "Mentha spicata",
        "commonNames": ["Spearmint", "Garden Mint", "Common Mint"],
        "description": "Mentha spicata is a species of mint commonly known as spearmint.",
        "habitat": "Temperate climates.",
        "distribution": ["Europe", "Asia", "North America"],
        "medicinalUses": ["Digestive aid", "Anti-inflammatory"],
        "chemicals": [
            {
                "name": "Carvone",
                "description": "A terpenoid with a minty odor.",
            },
            {
                "name": "Limonene",
                "description": "A colorless liquid hydrocarbon classified as a cyclic terpene.",
            },
        ],
    },
    {
        "scientificName": "Echinacea purpurea",
        "commonNames": ["Purple Coneflower", "Eastern Purple Coneflower"],
        "description": "Echinacea purpurea is a North American species of flowering plant in the sunflower family.",
        "habitat": "Prairies and open wooded areas.",
        "distribution": ["North America"],
        "medicinalUses": ["Immune booster", "Cold treatment"],
        "chemicals": [
            {
                "name": "Chicoric acid",
                "description": "A caffeic acid derivative found in Echinacea purpurea.",
            },
            {
                "name": "Alkylamides",
                "description": "Compounds that contribute to the plant's bioactivity.",
            },
        ],
    },
    {
        "scientificName": "Rosmarinus officinalis",
        "commonNames": ["Rosemary"],
        "description": "Rosmarinus officinalis, commonly known as rosemary, is a woody, perennial herb with fragrant evergreen needle-like leaves.",
        "habitat": "Mediterranean region.",
        "distribution": ["Mediterranean", "Europe", "North America"],
        "medicinalUses": ["Memory enhancement", "Anti-inflammatory"],
        "chemicals": [
            {
                "name": "Rosmarinic acid",
                "description": "A chemical compound with antioxidant properties.",
            },
            {
                "name": "Carnosic acid",
                "description": "A natural benzenediol abietane diterpene found in the herb rosemary.",
            },
        ],
    },
    {
        "scientificName": "Lavandula angustifolia",
        "commonNames": ["Lavender", "English Lavender"],
        "description": "Lavandula angustifolia, commonly known as lavender, is a flowering plant in the mint family.",
        "habitat": "Dry, sunny areas.",
        "distribution": ["Europe", "Mediterranean", "North America"],
        "medicinalUses": ["Anxiety relief", "Sleep aid"],
        "chemicals": [
            {
                "name": "Linalool",
                "description": "A naturally occurring terpene alcohol found in many flowers and spice plants.",
            },
            {
                "name": "Linalyl acetate",
                "description": "A naturally occurring phytochemical found in many flowers and spice plants.",
            },
        ],
    },
    {
        "scientificName": "Zingiber officinale",
        "commonNames": ["Ginger"],
        "description": "Zingiber officinale is a flowering plant whose rhizome, ginger root, or ginger, is widely used as a spice and a folk medicine.",
        "habitat": "Tropical and subtropical regions.",
        "distribution": ["Southeast Asia", "India", "Africa", "Caribbean"],
        "medicinalUses": ["Nausea relief", "Anti-inflammatory"],
        "chemicals": [
            {
                "name": "Gingerol",
                "description": "A bioactive compound found in fresh ginger.",
            },
            {
                "name": "Shogaol",
                "description": "A compound found in dried ginger.",
            },
        ],
    },
    {
        "scientificName": "Curcuma longa",
        "commonNames": ["Turmeric"],
        "description": "Curcuma longa is a flowering plant, the roots of which are used in cooking.",
        "habitat": "Tropical regions.",
        "distribution": ["India", "Southeast Asia"],
        "medicinalUses": ["Anti-inflammatory", "Antioxidant"],
        "chemicals": [
            {
                "name": "Curcumin",
                "description": "A bright yellow chemical produced by some plants.",
            },
            {
                "name": "Demethoxycurcumin",
                "description": "A derivative of curcumin found in turmeric.",
            },
        ],
    },
    {
        "scientificName": "Allium sativum",
        "commonNames": ["Garlic"],
        "description": "Allium sativum is a species in the onion genus, Allium.",
        "habitat": "Temperate climates.",
        "distribution": ["Central Asia", "Mediterranean"],
        "medicinalUses": ["Cardiovascular health", "Antimicrobial"],
        "chemicals": [
            {
                "name": "Allicin",
                "description": "A compound produced when garlic is crushed or chopped.",
            },
            {
                "name": "S-allyl cysteine",
                "description": "A bioavailable compound derived from garlic.",
            },
        ],
    },
    {
        "scientificName": "Panax ginseng",
        "commonNames": ["Ginseng", "Asian Ginseng"],
        "description": "Panax ginseng is a plant species whose root is commonly used in traditional medicine.",
        "habitat": "Cool, temperate regions.",
        "distribution": ["Korea", "China", "Russia"],
        "medicinalUses": ["Energy booster", "Cognitive function"],
        "chemicals": [
            {
                "name": "Ginsenosides",
                "description": "A class of steroid glycosides found exclusively in the plant genus Panax.",
            },
            {
                "name": "Polysaccharides",
                "description": "Complex carbohydrates found in ginseng.",
            },
        ],
    },
    {
        "scientificName": "Camellia sinensis",
        "commonNames": ["Tea Plant"],
        "description": "Camellia sinensis is a species of evergreen shrub whose leaves and leaf buds are used to produce tea.",
        "habitat": "Tropical and subtropical regions.",
        "distribution": ["China", "India", "Sri Lanka", "Japan"],
        "medicinalUses": ["Antioxidant", "Metabolism booster"],
        "chemicals": [
            {
                "name": "Catechins",
                "description": "A type of natural phenol and antioxidant.",
            },
            {
                "name": "Caffeine",
                "description": "A central nervous system stimulant found in tea.",
            },
        ],
    },
    {
        "scientificName": "Salvia officinalis",
        "commonNames": ["Sage"],
        "description": "Salvia officinalis, or sage, is a perennial, evergreen subshrub with woody stems, grayish leaves, and blue to purplish flowers.",
        "habitat": "Mediterranean region.",
        "distribution": ["Europe", "North America"],
        "medicinalUses": ["Digestive health", "Cognitive function"],
        "chemicals": [
            {
                "name": "Thujone",
                "description": "A ketone and a monoterpene that occurs naturally in sage.",
            },
            {
                "name": "Carnosol",
                "description": "A natural benzenediol diterpene found in the herb rosemary and sage.",
            },
        ],
    },
    {
        "scientificName": "Thymus vulgaris",
        "commonNames": ["Thyme"],
        "description": "Thymus vulgaris is a species of flowering plant in the mint family Lamiaceae, native to southern Europe.",
        "habitat": "Dry, rocky soils.",
        "distribution": ["Europe", "Mediterranean"],
        "medicinalUses": ["Respiratory health", "Antimicrobial"],
        "chemicals": [
            {
                "name": "Thymol",
                "description": "A natural monoterpenoid phenol derivative of cymene found in thyme.",
            },
            {
                "name": "Carvacrol",
                "description": "A monoterpenoid phenol with a characteristic pungent, warm odor of oregano.",
            },
        ],
    },
    {
        "scientificName": "Calendula officinalis",
        "commonNames": ["Marigold"],
        "description": "Calendula officinalis is a species of flowering plant in the daisy family Asteraceae.",
        "habitat": "Mediterranean region.",
        "distribution": ["Europe", "North America"],
        "medicinalUses": ["Skin treatment", "Anti-inflammatory"],
        "chemicals": [
            {
                "name": "Calendulin",
                "description": "A triterpenoid saponin found in marigold.",
            },
            {
                "name": "Carotenoids",
                "description": "A class of pigments found in plants, algae, and photosynthetic bacteria.",
            },
        ],
    },
    {
        "scientificName": "Hypericum perforatum",
        "commonNames": ["St. John's Wort"],
        "description": "Hypericum perforatum, known as perforate St John's-wort, is a flowering plant in the family Hypericaceae.",
        "habitat": "Meadows, woods, roadsides.",
        "distribution": ["Europe", "Asia", "North America"],
        "medicinalUses": ["Antidepressant", "Anti-inflammatory"],
        "chemicals": [
            {
                "name": "Hypericin",
                "description": "An anthraquinone derivative found in St John's Wort.",
            },
            {
                "name": "Hyperforin",
                "description": "A phloroglucinol derivative found in St John's Wort.",
            },
        ],
    },
    {
        "scientificName": "Matricaria chamomilla",
        "commonNames": ["Chamomile"],
        "description": "Matricaria chamomilla is an annual plant of the composite family Asteraceae.",
        "habitat": "Fields, roadsides, and gardens.",
        "distribution": ["Europe", "Asia", "North America"],
        "medicinalUses": ["Sleep aid", "Digestive health"],
        "chemicals": [
            {
                "name": "Apigenin",
                "description": "A flavonoid compound found in chamomile.",
            },
            {
                "name": "Chamazulene",
                "description": "An aromatic chemical compound that is a derivative of azulene found in chamomile essential oil.",
            },
        ],
    },
    {
        "scientificName": "Taraxacum officinale",
        "commonNames": ["Dandelion"],
        "description": "Taraxacum officinale is a species of flowering plant in the family Asteraceae.",
        "habitat": "Meadows, lawns, gardens.",
        "distribution": ["Worldwide"],
        "medicinalUses": ["Diuretic", "Liver health"],
        "chemicals": [
            {
                "name": "Taraxacin",
                "description": "A bitter compound found in dandelion.",
            },
            {
                "name": "Choline",
                "description": "A water-soluble nutrient found in dandelion.",
            },
        ],
    },
]


# Path to the folder containing images
pictures_folder = "pictures_folder"

# Get a list of all images in the folder
all_images = [
    f for f in os.listdir(pictures_folder) if f.endswith(".jpg") or f.endswith(".png")
]


# Function to validate plant data
def validate_plant_data(plant):
    required_fields = [
        "scientificName",
        "commonNames",
        "description",
        "habitat",
        "distribution",
        "medicinalUses",
        "chemicals",
    ]
    for field in required_fields:
        if field not in plant or not plant[field]:
            print(f"Validation failed: Missing required field {field}")
            return False
    if (
        not isinstance(plant["commonNames"], list)
        or not isinstance(plant["distribution"], list)
        or not isinstance(plant["medicinalUses"], list)
        or not isinstance(plant["chemicals"], list)
    ):
        print(
            "Validation failed: Fields commonNames, distribution, medicinalUses, and chemicals must be lists"
        )
        return False
    return True


# Iterate over each plant and send a POST request to create the plant
for i, plant in enumerate(plants):
    # Validate plant data
    if not validate_plant_data(plant):
        continue

    # Select up to 4 random images for this plant
    selected_images = random.sample(all_images, min(len(all_images), 4))

    # Prepare the files payload with selected images
    files = [
        (
            "images",
            (image, open(os.path.join(pictures_folder, image), "rb"), "image/jpeg"),
        )
        for image in selected_images
    ]

    # Prepare the data payload
    data = {
        "scientificName": plant["scientificName"],
        "commonNames": plant["commonNames"],
        "description": plant["description"],
        "habitat": plant["habitat"],
        "distribution": plant["distribution"],
        "medicinalUses": plant["medicinalUses"],
    }

    # Add chemicals to the data payload
    for j, chemical in enumerate(plant["chemicals"]):
        data[f"chemicals[{j}][name]"] = chemical["name"]
        data[f"chemicals[{j}][description]"] = chemical["description"]

    try:
        # Send the POST request
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Print the response
        print(f"Response for plant {i+1}: {response.status_code} - {response.json()}")

    except RequestException as e:
        print(f"Request failed for plant {i+1}: {e}")

    finally:
        # Close the files
        for file in files:
            file[1][1].close()
