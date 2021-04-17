/**
 * boniPRESS Edit Log Scripts
 * These scripts are used to edit or delete entries
 * in the boniPRESS Log.
 * @since 1.4
 * @version 1.1
 */
jQuery(function($) {

	/**
	 * Click To Toggle Script
	 */
	$( '.click-to-toggle' ).click(function(){
		var target = $(this).attr( 'data-toggle' );
		$( '#' + target ).toggle();
	});

	/**
	 * Delete Log Entry AJAX caller
	 */
	var bonipress_delete_log_entry = function( rowid, button ) {
		$.ajax({
			type       : "POST",
			data       : {
				action    : 'bonipress-delete-log-entry',
				token     : boniPRESSLog.tokens.delete_row,
				row       : rowid
			},
			dataType   : "JSON",
			url        : boniPRESSLog.ajaxurl,
			success    : function( response ) {
				// Debug
				//console.log( response );

				var parentrow = button.parent().parent().parent();
				var actioncol = button.parent().parent();

				if ( response.success ) {
					actioncol.empty();
					actioncol.text( response.data );

					parentrow.addClass( 'deleted-row' );
					parentrow.fadeOut( 3000, function(){ parentrow.remove(); });
				}
				else {
					actioncol.empty();
					actioncol.text( response.data );
				}
			},
			error      : function( jqXHR, textStatus, errorThrown ) {
				// Debug
				//console.log( jqXHR );
				//console.log( 'textStatus: ' + textStatus + ' | errorThrown: ' + errorThrown );
			}
		});
	}

	/**
	 * Log Entry Deletion Trigger
	 */
	$( '.bonipress-delete-row' ).click(function(){
		// Require user to confirm deletion
		if ( ! confirm( boniPRESSLog.messages.delete_row ) )
			return false;

		// Execute AJAX call
		bonipress_delete_log_entry( $(this).attr( 'data-id' ), $(this) );
	});

	var log_row_id = '';
	var log_user = '';
	var log_time = '';
	var log_cred = '';

	var log_entry_raw = '';
	var log_entry = '';

	/**
	 * Setup Log Editor Modal
	 */
	$('#edit-bonipress-log-entry').dialog({
		dialogClass : 'bonipress-edit-log-entry',
		draggable   : true,
		autoOpen    : false,
		title       : boniPRESSLog.title,
		closeText   : boniPRESSLog.close,
		modal       : true,
		width       : 500,
		height      : 'auto',
		resizable   : false,
		show        : {
			effect     : 'slide',
			direction  : 'up',
			duration   : 250
		},
		hide        : {
			effect     : 'slide',
			direction  : 'up',
			duration   : 250
		}
	});

	/**
	 * Edit Modal Trigger
	 */
	$( '.bonipress-open-log-entry-editor' ).click( function() {

		// Get the details we want to show
		log_row_id = $(this).attr( 'data-id' );
		log_user = $(this).parent().siblings( 'td.column-username' ).children( 'span' ).text();
		log_time = $(this).parent().siblings( 'td.column-time' ).text();
		log_cred = $(this).parent().siblings( 'td.column-creds' ).text();

		log_entry_raw = $(this).parent().siblings( 'td.column-entry' ).children( 'div.raw' ).text();
		log_entry = $(this).parent().siblings( 'td.column-entry' ).children( 'div.entry' ).text();

		// Show the modal window
		$( '#edit-bonipress-log-entry' ).dialog( 'open' );

		// Populate the form
		var username_el = $( '#edit-bonipress-log-entry #bonipress-username' );
		username_el.empty();
		username_el.text( log_user );

		var time_el = $( '#edit-bonipress-log-entry #bonipress-time' );
		time_el.empty();
		time_el.text( log_time );

		var creds_el = $( '#edit-bonipress-log-entry #bonipress-creds' );
		creds_el.empty();
		creds_el.text( log_cred );

		var entry_el = $( '#edit-bonipress-log-entry #bonipress-raw-entry' );
		entry_el.val( '' );
		entry_el.val( log_entry );

		var raw_entry_el = $( '#edit-bonipress-log-entry #bonipress-new-entry' );
		raw_entry_el.val( '' );
		raw_entry_el.val( log_entry_raw );
		
		$( 'input#bonipress-log-row-id' ).val( log_row_id );

	});

	/**
	 * Edit AJAX Call
	 */
	var bonipress_update_log_entry = function( rowid, entry, button ) {
		var button_label = button.val();

		$.ajax({
			type       : "POST",
			data       : {
				action    : 'bonipress-update-log-entry',
				token     : boniPRESSLog.tokens.update_row,
				row       : rowid,
				new_entry : entry
			},
			dataType   : "JSON",
			url        : boniPRESSLog.ajaxurl,
			beforeSend : function() {
			
				button.removeClass( 'button-primary' );
				button.addClass( 'button-secondary' );
				button.val( boniPRESSLog.working );
			},
			success    : function( response ) {
				// Debug
				console.log( response );

				var effected_row = $( '#bonipress-log-entry-' + response.data.row_id );
				button.removeClass( 'button-secondary' );

				if ( response.success ) {
					effected_row.addClass( 'updated-row' );
					effected_row.children( 'td.column-entry' ).children( 'div.raw' ).empty().html( response.data.new_entry_raw );

					$( '#edit-bonipress-log-entry #bonipress-raw-entry' ).val( response.data.new_entry );

					effected_row.children( 'td.column-entry' ).children( 'div.entry' ).empty().html( response.data.new_entry );

					$( '#edit-bonipress-log-entry #bonipress-new-entry' ).val( response.data.new_entry_raw );

					button.val( response.data.label );
					setTimeout(function(){ button.val( button_label ); button.addClass( 'button-primary' ); }, 5000 );
				}
				else {
					button.val( response.data );
					setTimeout(function(){ button.val( button_label ); button.addClass( 'button-primary' ); }, 5000 );
				}
			},
			error      : function( jqXHR, textStatus, errorThrown ) {
				// Debug
				//console.log( jqXHR );
				//console.log( 'textStatus: ' + textStatus + ' | errorThrown: ' + errorThrown );
			}
		});
	}

	/**
	 * Edit AJAX Call Trigger
	 */
	$( '#bonipress-update-log-entry' ).click( function() {
		bonipress_update_log_entry( $(this).next().val(), $( 'input#bonipress-new-entry' ).val(), $(this) );
	});

	/* global setUserSetting, ajaxurl, commonL10n, alert, confirm, toggleWithKeyboard, pagenow */
	var showNotice, adminMenu, columns, validateForm, screenMeta;

	// Removed in 3.3.
	// (perhaps) needed for back-compat
	adminMenu = {
		init : function() {},
		fold : function() {},
		restoreMenuState : function() {},
		toggle : function() {},
		favorites : function() {}
	};

	// show/hide/save table columns
	columns = {
		init : function() {
			var that = this;
			$('.hide-column-tog', '#adv-settings').click( function() {
				var $t = $(this), column = $t.val();
				if ( $t.prop('checked') )
					that.checked(column);
				else
					that.unchecked(column);

				columns.saveManageColumnsState();
			});
		},

		saveManageColumnsState : function() {
			var hidden = this.hidden();
			$.post(ajaxurl, {
				action: 'hidden-columns',
				hidden: hidden,
				screenoptionnonce: $('#screenoptionnonce').val(),
				page: pagenow
			});
		},

		checked : function(column) {
			$('.' + column).show();
			this.colSpanChange(+1);
		},

		unchecked : function(column) {
			$('.' + column).hide();
			this.colSpanChange(-1);
		},

		hidden : function() {
			return $('.manage-column').filter(':hidden').map(function() { return this.id; }).get().join(',');
		},

		useCheckboxesForHidden : function() {
			this.hidden = function(){
				return $('.hide-column-tog').not(':checked').map(function() {
					var id = this.id;
					return id.substring( id, id.length - 5 );
				}).get().join(',');
			};
		},

		colSpanChange : function(diff) {
			var $t = $('table').find('.colspanchange'), n;
			if ( !$t.length )
				return;
			n = parseInt( $t.attr('colspan'), 10 ) + diff;
			$t.attr('colspan', n.toString());
		}
	};

	$(document).ready(function(){columns.init();});
});
