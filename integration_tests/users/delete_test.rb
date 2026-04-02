require_relative "../test_helper"

class IndexTest < Minitest::Test
  def test_delete_user
    response, _payload = register_user
    assert_equal 201, response.status
    
    body = json_body(response)
    token = body["accessToken"]

    refute_nil token
    refute_empty token

    me_req = get_me(token)
    assert_equal 200, me_req.status, "Expected 200 when user registered before delete"

    delete_req = delete_me(token)
    body = JSON.parse(delete_req.body)

    assert_equal 200, delete_req.status
    assert body.key?("message"), "Response should contain data"

    me_req_deleted = get_me(token)
    assert_equal 404, me_req_deleted.status, "Expected 404 not found when user deleted"
  end

  private

  def json_body(response)
    JSON.parse(response.body)
  end
end