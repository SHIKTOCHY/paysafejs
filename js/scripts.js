// Base 64 encoded version the Single-Use Token API key.
// Create the key below by concatenating the API username and password
// separated by a colon and Base 64 encoding the result
var apiKey = "ZnJhbmNvaXNuZXJvbjpCLXFhMi0wLTU3OTkwYzA5LTAtMzAyYzAyMTQyNWMyNzE1ZGRjNGQ5MGMwZTFlYjgzMTFiMTFmZmRkYjJlZWQ0YjY1MDIxNDUzOTU0MjVlYTdmODljOTc0ZWMzNjRmODA3NGNkMWY2M2Q0NzlkNzU=";

$(document).ready(function() {

	var $form = $('#payment-form');
	$form.find('.subscribe').prop('disabled', true);

	var options = {

		// select the Paysafe test / sandbox environment
		environment: "TEST",

		// set the CSS selectors to identify the payment field divs above
		// set the placeholder text to display in these fields
		fields: {
			cardNumber: {
				selector: "#cardNumber",
				placeholder: "Card Number"
			},
			expiryDate: {
				selector: "#cardExpiry",
				placeholder: "MM / YY"
			},
			cvv: {
				selector: "#cardCVC",
				placeholder: "CVV"
			}
		}
	};
	
	// initalize the hosted iframes using the SDK setup function
	paysafe.fields.setup(apiKey, options, function(instance, error) {
		if (error) {
			console.log(error);
		}
		
		var subscribeButton = $form.find('.subscribe');

		instance.fields("cvv cardNumber expiryDate").valid(function (eventInstance, event) {
			$(event.target.containerElement).closest('.form-control').removeClass('error').addClass('success');

			if (paymentFormReady()) {
				$form.find('.subscribe').prop('disabled', false);
			}
		});

		instance.fields("cvv cardNumber expiryDate").invalid(function (eventInstance, event) {
			$(event.target.containerElement).closest('.form-control').removeClass('success').addClass('error');
			if (!paymentFormReady()) {
				$form.find('.subscribe').prop('disabled', true);
			}
		});
		
		instance.on("CardBrandRecognition", function(instance, event) {
            if (instance.getCardBrand()) {
				var cardBrand = instance.getCardBrand().replace(/\s+/g, '');
				
				switch (cardBrand) {
					case "AmericanExpress":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-amex');
					  break;
					case "MasterCard":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-mastercard');
					  break;
					case "Visa":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-visa');
					  break;
					case "Diners":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-diners-club');
					  break;
					case "JCB":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-jcb');
					  break;
					case "Maestro":
					  $form.find(".fa").removeClass().addClass('fa fa-cc-discover');
					  break;
				}
			} else {
				$form.find(".fa").removeClass().addClass('fa fa-credit-card');
            }
		});
		
		subscribeButton.bind("click", function (event) {
			instance.tokenize(function(instance, error, result) {
				if (error) {
					console.log(error);
					$form.find('.subscribe').html('Try again').prop('disabled', false);

					/* Show Paysafe errors on the form */
					$form.find('.payment-errors').text(error.detailedMessage);
					$form.find('.payment-errors').closest('.row').show();
				} else {
					/* Visual feedback */
					$form.find('.subscribe').html('Processing <i class="fa fa-spinner fa-pulse"></i>');

					/* Hide Paysafe errors on the form */
					$form.find('.payment-errors').closest('.row').hide();
					$form.find('.payment-errors').text("");
                
					// response contains token          
					console.log("Card tokenization successful, token " + result.token);
                
					// AJAX - you would send 'token' to your server here and invoke Authorization agains Paysafe's Card API
					delay(function(){                
						// do stuff
						$form.find('.subscribe').html('Payment successful <i class="fa fa-check"></i>');
					});
				}
			});
		});
	});
});

function paymentFormReady() {
    return $('#cardNumber').hasClass("success") 
			&& $('#cardExpiry').hasClass("success") 
			&& $('#cardCVC').hasClass("success");
}

var timer = 0;
function delay(callback) {
	clearTimeout(timer);
	timer = setTimeout(callback, 2000);
}