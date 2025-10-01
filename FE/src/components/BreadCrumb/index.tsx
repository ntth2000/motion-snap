import { Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react';

const CustomBreadCrumb: React.FC = () => {
  return (
    <Breadcrumb
      items={[
        {
          href: '',
          title: <HomeOutlined />,
        },
        {
          href: '',
          title: (
            <>
              <UserOutlined />
              <span>Application List</span>
            </>
          ),
        },
        {
          title: 'Application',
        },
      ]}
    />
  );
};

export default CustomBreadCrumb;
