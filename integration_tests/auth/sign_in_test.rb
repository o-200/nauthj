require_relative "../test_helper"

class SignInTest < Minitest::Test
  def test_register_and_sign_in
    register_response, payload = register_user
    assert_equal 201, register_response.status, "Register failed: #{register_response.body}"

    sign_in_response = sign_in_user(
      login: payload[:login],
      password: payload[:password]
    )

    assert_equal 200, sign_in_response.status, "Sign in failed: #{sign_in_response.body}"

    body = json_body(sign_in_response)

    assert body.key?("accessToken"), "Missing accessToken"
    assert body.key?("refreshToken"), "Missing refreshToken"

    refute_empty body["accessToken"].to_s
    refute_empty body["refreshToken"].to_s
  end
end