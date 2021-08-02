<?php

class Subscribe {

	public $user;
	public $tableName = 'subscribers';

	function __construct()
	{
		add_action('wp_ajax_subscribeUser', [ $this, 'subscribeUser' ]);
		add_action('wp_ajax_nopriv_subscribeUser', [ $this, 'subscribeUser' ]);
		add_action('init', [ $this, 'createSubscribersTable'] );
	}

	public function subscribeUser() {

		$nonce  = filter_input(INPUT_POST, 'nonce', FILTER_SANITIZE_STRING);
		$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_STRING);

		if ( !wp_verify_nonce($nonce, 'csn') ) {
			wp_send_json_error('nonce issue');
		}

		if ( !$email ) {
			wp_send_json_error('Data is not set');
		}

		$this->user->email = $email;

		if( self::checkSubscriber() ){
			wp_send_json_error('Email is already on the mailing list');
		}

		if ( self::insertUserToSubscribersTable() ) {

			wp_send_json_error('E-mail is not sent');
		}

		wp_send_json_success();
	}

	public function checkSubscriber() {

		global $wpdb;

		$email = $wpdb->esc_like( $this->user->email );

		$user = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM `{$wpdb->base_prefix}{$this->tableName}` WHERE email = %s", $email
		) );

		if ( !$user ) {
			return false;
		}
		return true;

	}

	public function createSubscribersTable() {

		global $wpdb;

		$query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $wpdb->base_prefix.$this->tableName ) );
		if ( $wpdb->get_var( $query ) === $wpdb->base_prefix.$this->tableName ) {
			return true;
		}

		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE `{$wpdb->base_prefix}{$this->tableName}` (
  				ID integer NOT NULL auto_increment,
  				email varchar(100) NOT NULL,
  				PRIMARY KEY (ID)	
				) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

		dbDelta($sql);

		if ( $wpdb->get_var( $query ) === $wpdb->base_prefix.$this->tableName) {
			return true;
		}

		return false;

	}

	public function insertUserToSubscribersTable() {

		global $wpdb;

		$wpdb->insert($wpdb->prefix . $this->tableName, [
			'email'     => $this->user->email
		], '%s') ;
	}
}

new Subscribe();